import { REPORT_LOGO } from '../data.js'
import { formatAmount } from '../utils/summary.js'

/* Página final: consolidado da semana + encerramento. Mesmas restrições da
   capa e dos slides de OM (ver CoverPage.jsx). */
export function ClosingPage({ deck, summary }) {
  const hoursLabel = `${formatAmount(summary.actualHours)}h / ${formatAmount(summary.plannedHours)}h`

  return (
    <article className="report-page report-closing" data-slide-id="__closing__">
      <header className="closing-head">
        <div>
          <h2>{deck.closingTitle || 'Resumo da Semana'}</h2>
          <p>{summary.weekReference || 'Semana'} <i /> {summary.site || 'Unidade'}</p>
        </div>
        <img className="report-logo" src={REPORT_LOGO} alt="Grupo GPS e GRSA" />
      </header>

      <section className="closing-figures" aria-label="Consolidado da semana">
        <div>
          <strong>{summary.omCount}</strong>
          <small>{summary.omCount === 1 ? 'OM executada' : 'OMs executadas'}</small>
        </div>
        <div>
          <strong>{summary.completedCount}</strong>
          <small>{summary.completedCount === 1 ? 'OM concluída' : 'OMs concluídas'}</small>
        </div>
        <div>
          <strong>{hoursLabel}</strong>
          <small>Realizado / previsto</small>
        </div>
        <div>
          <strong>{formatAmount(summary.area)} m²</strong>
          <small>Área executada</small>
        </div>
      </section>

      <section className="closing-safety">
        <strong>{summary.safety || 'Não informado'}</strong>
        <small>Indicador de segurança da semana</small>
      </section>

      <section className="closing-people" aria-label="Responsáveis">
        <span><b>Fiscal</b>{summary.responsible || 'Não informado'}</span>
        <span><b>Supervisor</b>{summary.supervisor || 'Não informado'}</span>
        <span><b>Executora</b>{summary.contractor || 'Não informada'}</span>
      </section>

      <footer className="closing-message">
        <strong>{deck.closingMessage || 'Obrigado'}</strong>
        <span>{summary.category || 'Serviços Operacionais'}</span>
      </footer>
    </article>
  )
}
