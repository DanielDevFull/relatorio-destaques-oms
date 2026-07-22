import { ArrowRight, CalendarDays, Clock3, Maximize2, ShieldCheck } from 'lucide-react'
import { REPORT_LOGO } from '../data.js'
import { formatDate, progressLabel } from '../utils/formatters.js'
import { PhotoMedia } from './PhotoMedia.jsx'

// Uma razão única contra um limite pede um medidor, não um velocímetro: o
// número é o protagonista e a barra dá a leitura periférica. Sem SVG — o
// medidor é layout puro, o que o torna trivialmente seguro na rasterização.
function ProgressMeter({ progress }) {
  const normalized = Math.max(0, Math.min(100, Number(progress) || 0))
  const status = progressLabel(normalized)
  const state = normalized >= 100 ? 'complete' : normalized > 0 ? 'running' : 'idle'

  return (
    <section
      className={`progress-meter is-${state}`}
      aria-label={`Progresso da OM: ${normalized}% ${status}`}
    >
      <h4>Progresso da OM</h4>
      <strong className="meter-value">{normalized}%</strong>
      <div className="meter-track" aria-hidden="true">
        <div className="meter-fill" style={{ width: `${normalized}%` }} />
      </div>
      <span className="meter-status">{status}</span>
    </section>
  )
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="report-stat">
      <span className="stat-icon"><Icon /></span>
      <span>
        <small>{label}</small>
        <strong>{value || '—'}</strong>
      </span>
    </div>
  )
}

export function ReportPreview({ report }) {
  const sameDate = report.startDate === report.endDate
  const periodValue = sameDate
    ? formatDate(report.startDate)
    : `${formatDate(report.startDate)} — ${formatDate(report.endDate)}`

  return (
    <article className="report-page" data-slide-id={report.id}>
      <header className="report-header">
        <div className="report-heading">
          <h2>Destaques Operacionais</h2>
          <p>{report.weekReference || 'Semana'} <i /> {report.site || 'Unidade'}</p>
        </div>
        <img className="report-logo" src={REPORT_LOGO} alt="Grupo GPS e GRSA" />
        <div className="report-code">{report.workOrder || 'OM não informada'}</div>
      </header>

      <section className="report-content">
        <div className="report-main-column">
          <div className="report-summary">
            <h3>{report.activityTitle || 'Título da atividade'}</h3>
            <div className="report-summary-meta">
              <p>{report.location || 'Local / área'}</p>
              <span>{report.classification || 'Classificação não informada'}</span>
            </div>
          </div>

          <section className="comparison" aria-label="Comparativo antes e depois">
            <figure>
              <figcaption>Antes</figcaption>
              <PhotoMedia photo={report.beforePhoto} alt="Registro antes da atividade" />
            </figure>
            <span className="comparison-arrow" aria-hidden="true"><ArrowRight /></span>
            <figure>
              <figcaption>Depois</figcaption>
              <PhotoMedia photo={report.afterPhoto} alt="Registro depois da atividade" />
            </figure>
          </section>
        </div>

        <aside className="report-insights" aria-label="Resumo executivo da OM">
          <section className="insight-block">
            <h4>Entrega da semana</h4>
            <p>{report.description || 'Adicione um resumo executivo para a atividade realizada.'}</p>
          </section>
          <section className="insight-block insight-impact">
            <h4>Impacto</h4>
            <p>{report.impact || 'Adicione o impacto gerado pela entrega.'}</p>
          </section>
          <ProgressMeter progress={report.progress} />
        </aside>
      </section>

      <section className="report-stats" aria-label="Indicadores da atividade">
        <Stat
          icon={Clock3}
          label="Horas realizadas / previstas"
          value={`${report.actualHours || '0'}h / ${report.plannedHours || '0'}h`}
        />
        <Stat
          icon={Maximize2}
          label="Área executada"
          value={`${report.area || '0'} m²`}
        />
        <Stat
          icon={CalendarDays}
          label={sameDate ? 'Data da entrega' : 'Período da execução'}
          value={periodValue}
        />
        <Stat
          icon={ShieldCheck}
          label="Segurança"
          value={report.safety || 'Não informado'}
        />
      </section>

      <footer className="report-footer">
        <div className="report-footer-people">
          <span><b>Fiscal</b>{report.responsible || 'Não informado'}</span>
          <span><b>Supervisor</b>{report.supervisor || 'Não informado'}</span>
          <span><b>Equipe</b>{report.team || 'Não informada'}</span>
        </div>
        <div className="report-footer-service">
          <span><b>Executora</b>{report.contractor || 'Não informada'}</span>
          <span>{report.category || 'Serviços Operacionais'}</span>
        </div>
      </footer>
    </article>
  )
}
