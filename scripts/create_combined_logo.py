#!/usr/bin/env python3
"""Create a deterministic vector lockup from the two supplied logo images."""

from __future__ import annotations

import json
import subprocess
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "output" / "logo-grupo-gps-grsa"
GPS_SOURCE = Path(
    "/Users/danieldasilvaalves/Downloads/WhatsApp Unknown 2026-07-13 at 15.59.22/"
    "WhatsApp Image 2026-07-13 at 15.58.44 (4).jpeg"
)
GRSA_SOURCE = Path(
    "/Users/danieldasilvaalves/Downloads/WhatsApp Image 2026-07-15 at 17.33.42.jpeg"
)


def rdp(points: list[tuple[int, int]], epsilon: float) -> list[tuple[int, int]]:
    """Ramer-Douglas-Peucker simplification for an open polyline."""
    if len(points) <= 2:
        return points

    x1, y1 = points[0]
    x2, y2 = points[-1]
    dx = x2 - x1
    dy = y2 - y1
    denom = (dx * dx + dy * dy) ** 0.5

    max_distance = -1.0
    max_index = 0
    for index, (x, y) in enumerate(points[1:-1], start=1):
        if denom == 0:
            distance = ((x - x1) ** 2 + (y - y1) ** 2) ** 0.5
        else:
            distance = abs(dy * x - dx * y + x2 * y1 - y2 * x1) / denom
        if distance > max_distance:
            max_distance = distance
            max_index = index

    if max_distance > epsilon:
        left = rdp(points[: max_index + 1], epsilon)
        right = rdp(points[max_index:], epsilon)
        return left[:-1] + right
    return [points[0], points[-1]]


def simplify_loop(
    loop: list[tuple[int, int]], epsilon: float
) -> list[tuple[int, int]]:
    """Simplify a closed polygon without collapsing its closure."""
    points = loop[:-1] if loop and loop[0] == loop[-1] else loop[:]
    if len(points) < 4:
        return points + points[:1]

    anchor_index = min(range(len(points)), key=lambda i: (points[i][0], points[i][1]))
    points = points[anchor_index:] + points[:anchor_index]
    x0, y0 = points[0]
    split_index = max(
        range(1, len(points)),
        key=lambda i: (points[i][0] - x0) ** 2 + (points[i][1] - y0) ** 2,
    )

    first_arc = rdp(points[: split_index + 1], epsilon)
    second_arc = rdp(points[split_index:] + [points[0]], epsilon)
    simplified = first_arc[:-1] + second_arc[:-1]

    if len(simplified) < 3:
        simplified = points
    return simplified + [simplified[0]]


def trace_mask(mask: np.ndarray, epsilon: float) -> str:
    """Convert a binary pixel mask to SVG paths by tracing exposed pixel edges."""
    height, width = mask.shape
    outgoing: dict[tuple[int, int], set[tuple[int, int]]] = defaultdict(set)
    edges: set[tuple[tuple[int, int], tuple[int, int]]] = set()

    def add_edge(start: tuple[int, int], end: tuple[int, int]) -> None:
        outgoing[start].add(end)
        edges.add((start, end))

    ys, xs = np.where(mask)
    for y, x in zip(ys.tolist(), xs.tolist()):
        if y == 0 or not mask[y - 1, x]:
            add_edge((x, y), (x + 1, y))
        if x == width - 1 or not mask[y, x + 1]:
            add_edge((x + 1, y), (x + 1, y + 1))
        if y == height - 1 or not mask[y + 1, x]:
            add_edge((x + 1, y + 1), (x, y + 1))
        if x == 0 or not mask[y, x - 1]:
            add_edge((x, y + 1), (x, y))

    direction_order = [(1, 0), (0, 1), (-1, 0), (0, -1)]
    loops: list[list[tuple[int, int]]] = []

    while edges:
        start, end = next(iter(edges))
        loop = [start, end]
        edges.remove((start, end))
        outgoing[start].discard(end)
        previous = start
        current = end

        while current != start:
            candidates = [point for point in outgoing[current] if (current, point) in edges]
            if not candidates:
                break

            incoming = (current[0] - previous[0], current[1] - previous[1])
            incoming_index = direction_order.index(incoming)
            preferred = [
                direction_order[(incoming_index + 1) % 4],
                direction_order[incoming_index],
                direction_order[(incoming_index - 1) % 4],
                direction_order[(incoming_index + 2) % 4],
            ]
            by_direction = {
                (point[0] - current[0], point[1] - current[1]): point
                for point in candidates
            }
            next_point = next(
                (by_direction[direction] for direction in preferred if direction in by_direction),
                candidates[0],
            )
            edges.remove((current, next_point))
            outgoing[current].discard(next_point)
            previous, current = current, next_point
            loop.append(current)

        if len(loop) >= 4 and loop[0] == loop[-1]:
            loops.append(simplify_loop(loop, epsilon))

    commands: list[str] = []
    for loop in loops:
        commands.append(f"M{loop[0][0]} {loop[0][1]}")
        for x, y in loop[1:-1]:
            commands.append(f"L{x} {y}")
        commands.append("Z")
    return "".join(commands)


def crop_and_trace(
    source: Path,
    box: tuple[int, int, int, int],
    threshold: int,
    upscale: int = 1,
    epsilon: float = 0.8,
) -> tuple[str, int, int]:
    image = Image.open(source).convert("RGB").crop(box)
    if upscale > 1:
        image = image.resize(
            (image.width * upscale, image.height * upscale),
            Image.Resampling.LANCZOS,
        )
    pixels = np.asarray(image)
    luminance = (
        0.2126 * pixels[:, :, 0]
        + 0.7152 * pixels[:, :, 1]
        + 0.0722 * pixels[:, :, 2]
    )
    mask = luminance < threshold
    return trace_mask(mask, epsilon), image.width, image.height


def group(path: str, source_size: tuple[int, int], target: tuple[float, float, float]) -> str:
    x, y, target_width = target
    source_width, source_height = source_size
    scale = target_width / source_width
    return (
        f'<g transform="translate({x:.2f} {y:.2f}) scale({scale:.8f})">'
        f'<path d="{path}"/></g>'
    )


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    gps_path, gps_width, gps_height = crop_and_trace(
        GPS_SOURCE,
        (8, 15, 318, 101),
        threshold=190,
        upscale=6,
        epsilon=1.25,
    )
    grsa_path, grsa_width, grsa_height = crop_and_trace(
        GRSA_SOURCE,
        (180, 155, 1420, 760),
        threshold=175,
        epsilon=0.85,
    )
    tagline_path, tagline_width, tagline_height = crop_and_trace(
        GRSA_SOURCE,
        (225, 835, 1360, 1058),
        threshold=175,
        epsilon=0.75,
    )

    gps_group = group(gps_path, (gps_width, gps_height), (90, 170, 930))
    grsa_group = group(grsa_path, (grsa_width, grsa_height), (1160, 55, 720))
    tagline_group = group(
        tagline_path,
        (tagline_width, tagline_height),
        (1160, 420, 720),
    )

    svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="2000" height="600" viewBox="0 0 2000 600" role="img" aria-labelledby="title description">
  <title id="title">Grupo GPS e GRSA</title>
  <desc id="description">Assinatura conjunta com Grupo GPS à esquerda e GRSA à direita.</desc>
  <g id="grupo-gps" fill="#101E2A" fill-rule="evenodd">{gps_group}</g>
  <rect id="separador" x="1088" y="115" width="4" height="370" rx="2" fill="#AAB2B9"/>
  <g id="grsa" fill="#231F20" fill-rule="evenodd">{grsa_group}{tagline_group}</g>
</svg>
'''

    svg_path = OUTPUT_DIR / "logo-grupo-gps-grsa.svg"
    svg_path.write_text(svg, encoding="utf-8")

    transparent_preview = OUTPUT_DIR / ".preview-transparent.png"
    preview_path = OUTPUT_DIR / "logo-grupo-gps-grsa-preview.png"
    subprocess.run(
        ["sips", "-s", "format", "png", str(svg_path), "--out", str(transparent_preview)],
        check=True,
        capture_output=True,
        text=True,
    )
    rendered = Image.open(transparent_preview).convert("RGBA")
    white_background = Image.new("RGBA", rendered.size, "white")
    white_background.alpha_composite(rendered)
    white_background.convert("RGB").save(preview_path, quality=95)
    transparent_preview.unlink(missing_ok=True)

    manifest = {
        "asset": "logo-grupo-gps-grsa.svg",
        "preview": "logo-grupo-gps-grsa-preview.png",
        "format": "SVG 1.1-compatible",
        "canvas": {"width": 2000, "height": 600, "background": "transparent"},
        "order": ["Grupo GPS", "GRSA"],
        "colors": {"Grupo GPS": "#101E2A", "GRSA": "#231F20", "separator": "#AAB2B9"},
        "sources": [str(GPS_SOURCE), str(GRSA_SOURCE)],
        "method": "Deterministic thresholding, contour tracing, and vector composition",
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }
    (OUTPUT_DIR / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    (OUTPUT_DIR / "provenance.txt").write_text(
        "Logo conjunto criado a partir das duas imagens fornecidas pelo usuário.\n"
        "Os contornos foram vetorizados de forma determinística; nenhum texto foi recriado por IA.\n"
        "Fundo transparente. Ordem: Grupo GPS, depois GRSA.\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
