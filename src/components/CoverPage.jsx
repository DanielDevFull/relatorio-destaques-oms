import { REPORT_LOGO } from '../data.js'
import { formatDate } from '../utils/formatters.js'
import { formatAmount } from '../utils/summary.js'
import { CoverArtwork } from './CoverArtwork.jsx'

/* Capa, inspirada no material manual: barra amarela + título, marcador da
   semana no canto, faixa de logos, bloco de equipe e a paisagem ao fundo.

   Herda `.report-page` e as mesmas restrições: nada de backdrop-filter,
   filter ou token de tema, senão a rasterização do PPTX quebra. */
export function CoverPage({ deck, summary }) {
  const period = summary.periodStart === summary.periodEnd
    ? formatDate(summary.periodStart)
    : `${formatDate(summary.periodStart)} a ${formatDate(summary.periodEnd)}`

  // Preposto e supervisor caem para os dados das OMs quando não preenchidos.
  const crew = [
    ['Preposto', deck.preposto || summary.responsible],
    ['Coord Plan', deck.coordPlan],
    ['Planner', deck.planner],
    ['Supervisor', deck.deckSupervisor || summary.supervisor],
  ]

  return (
    <article className="report-page report-cover" data-slide-id="__cover__">
      <CoverArtwork />

      <div className="cover-body">
        <header className="cover-headline">
          <div className="cover-titleblock">
            <h2>{deck.coverTitle || 'Report Bem Estar'}</h2>
            <p>{deck.coverSubtitle || [summary.category, summary.site].filter(Boolean).join(' · ')}</p>
            <p>{summary.contractor}</p>
          </div>
          <span className="cover-week">{summary.weekReference || '—'}</span>
        </header>

        <div className="cover-logos" aria-label="Marcas">
          <img className="report-logo" src={REPORT_LOGO} alt="Grupo GPS e GRSA" />
        </div>

        <section className="cover-summary" aria-label="Resumo da semana">
          <div>
            <strong>{summary.omCount}</strong>
            <small>{summary.omCount === 1 ? 'OM executada' : 'OMs executadas'}</small>
          </div>
          <div>
            <strong>{formatAmount(summary.actualHours)}h</strong>
            <small>Horas realizadas</small>
          </div>
          <div>
            <strong>{formatAmount(summary.area)} m²</strong>
            <small>Área executada</small>
          </div>
          <div>
            <strong>{period}</strong>
            <small>Período</small>
          </div>
        </section>

        <section className="cover-crew" aria-label="Equipe responsável">
          <strong>{summary.contractor || 'GRSA'}</strong>
          {crew.map(([role, name]) => (
            <span key={role}><b>{role}:</b> {name || '—'}</span>
          ))}
        </section>
      </div>
    </article>
  )
}
