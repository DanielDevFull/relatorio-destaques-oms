/* Paisagem da capa, no espírito do material manual: cordilheira em camadas
   com árvores estilizadas, na paleta Vale.

   Inspirado na arte original, não uma cópia — a escavadeira e o caminhão do
   material antigo não foram reproduzidos porque são desenhos detalhados que
   eu não recriaria fielmente. Se você tiver o arquivo original, ele entra no
   lugar deste componente.

   É uma FAIXA larga e baixa, ancorada no rodapé: o conteúdo da capa (título,
   logos, indicadores, equipe) vive acima dela, como no material original.

   Todo o preenchimento é ATRIBUTO SVG, nunca classe CSS: na rasterização do
   PPTX as regras de classe não alcançam os filhos do SVG e `fill` volta ao
   padrão preto. */

const TONE = {
  ridgeBack: '#0d6b68',
  ridgeMid: '#0f8a86',
  ridgeFront: '#12a8a2',
  ridgeLight: '#4cc9c3',
  trunk: '#3d2f24',
}

function Tree({ x, y, scale = 1, tone }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M0 0 L0 -30" stroke={TONE.trunk} strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <path d="M-10 -20 L0 -26" stroke={TONE.trunk} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M11 -24 L0 -30" stroke={TONE.trunk} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M-30 -30 A 30 21 0 0 1 30 -30 Z" fill={tone} />
    </g>
  )
}

export function CoverArtwork() {
  return (
    <svg
      className="cover-artwork"
      viewBox="0 0 1000 300"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      {/* Cordilheira ao fundo, descendo da direita para a esquerda */}
      <path
        d="M1000 8 C 894 34, 806 92, 720 150 C 648 198, 566 240, 470 268 L1000 300 Z"
        fill={TONE.ridgeBack}
      />
      {/* Veios claros na encosta */}
      <path d="M930 52 C 900 84, 880 112, 862 142 C 890 112, 922 78, 952 56 Z" fill={TONE.ridgeLight} opacity="0.5" />
      <path d="M866 104 C 838 140, 818 168, 802 196 C 830 166, 862 132, 890 110 Z" fill={TONE.ridgeLight} opacity="0.34" />

      {/* Encosta intermediária */}
      <path
        d="M1000 116 C 906 146, 820 196, 748 238 C 690 270, 630 288, 566 300 L1000 300 Z"
        fill={TONE.ridgeMid}
      />

      {/* Colinas da frente, à esquerda */}
      <path
        d="M0 236 C 78 196, 186 192, 282 226 C 366 256, 448 282, 530 300 L0 300 Z"
        fill={TONE.ridgeFront}
      />
      <path d="M0 268 C 52 244, 122 244, 176 272 L176 300 L0 300 Z" fill={TONE.ridgeLight} opacity="0.6" />

      <Tree x={104} y={258} scale={0.9} tone={TONE.ridgeMid} />
      <Tree x={268} y={288} scale={0.72} tone={TONE.ridgeLight} />
      <Tree x={706} y={276} scale={0.8} tone={TONE.ridgeLight} />
      <Tree x={868} y={236} scale={0.62} tone={TONE.ridgeMid} />
    </svg>
  )
}
