import { ImageDown, Minus, Plus, Presentation } from 'lucide-react'

export function PreviewToolbar({
  zoom,
  slideCount,
  onZoomChange,
  onExportPptx,
  onExportImage,
  exportState,
}) {
  const decrease = () => onZoomChange(Math.max(60, zoom - 6))
  const increase = () => onZoomChange(Math.min(106, zoom + 6))

  return (
    <div className="preview-toolbar" aria-label="Controles da pré-visualização">
      <div className="format-control" aria-label="Formato 4K UHD, slide 16 por 9">
        4K UHD · {slideCount} {slideCount === 1 ? 'slide' : 'slides'} · 16:9
      </div>
      <span className="toolbar-separator" />
      <div className="zoom-controls">
        <button type="button" aria-label="Diminuir zoom" onClick={decrease} disabled={zoom <= 60}>
          <Minus size={17} />
        </button>
        <output aria-label="Nível de zoom">{zoom}%</output>
        <button type="button" aria-label="Aumentar zoom" onClick={increase} disabled={zoom >= 106}>
          <Plus size={17} />
        </button>
      </div>
      <span className="toolbar-separator" />
      <div className="toolbar-export-actions">
        <button className="toolbar-pptx-button" type="button" onClick={onExportPptx} disabled={exportState === 'pptx' || exportState === 'png'}>
          <Presentation size={16} />
          <span>{exportState === 'pptx' ? 'Gerando 4K…' : 'PowerPoint 4K'}</span>
        </button>
        <button type="button" onClick={onExportImage} disabled={exportState === 'pptx' || exportState === 'png'}>
          <ImageDown size={16} />
          <span>{exportState === 'png' ? 'Gerando 4K…' : 'PNG 4K'}</span>
        </button>
      </div>
    </div>
  )
}
