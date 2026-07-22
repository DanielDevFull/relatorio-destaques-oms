import { REPORT_LOGO } from '../data.js'
import { formatDate } from '../utils/formatters.js'
import { formatAmount } from '../utils/summary.js'

/* Capa da apresentação. Herda `.report-page` — mesma base 16:9 branca dos
   slides de OM, com as mesmas restrições: nada de backdrop-filter, filter
   ou token de tema aqui dentro, senão a rasterização do PPTX quebra. */
export function CoverPage({ deck, summary }) {
  const period = summary.periodStart === summary.periodEnd
    ? formatDate(summary.periodStart)
    : `${formatDate(summary.periodStart)} a ${formatDate(summary.periodEnd)}`

  return (
    <article className="report-page report-cover" data-slide-id="__cover__">
      <header className="cover-head">
        <img className="report-logo" src={REPORT_LOGO} alt="Grupo GPS e GRSA" />
      </header>

      <section className="cover-title">
        <h2>{deck.coverTitle || 'Destaques Operacionais'}</h2>
        <p>{deck.coverSubtitle || summary.category || 'Serviços Operacionais'}</p>
      </section>

      <section className="cover-meta" aria-label="Identificação da apresentação">
        <span><b>Semana</b>{summary.weekReference || 'Não informada'}</span>
        <span><b>Unidade</b>{summary.site || 'Não informada'}</span>
        <span><b>Período</b>{period}</span>
      </section>

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
          <strong>{summary.safety || 'Não informado'}</strong>
          <small>Segurança</small>
        </div>
      </section>
    </article>
  )
}
