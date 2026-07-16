import { useId } from 'react'
import { ArrowRight, CalendarDays, Clock3, Maximize2, ShieldCheck } from 'lucide-react'
import { REPORT_LOGO } from '../data.js'
import { formatDate, progressLabel } from '../utils/formatters.js'
import { PhotoMedia } from './PhotoMedia.jsx'

const SPEEDOMETER_TICKS = [0, 25, 50, 75, 100]
const SPEEDOMETER_LABELS = [0, 50, 100]
const SPEEDOMETER_PATH = 'M 16 66 A 44 44 0 0 1 104 66'

function getSpeedometerPoint(value, radius) {
  const angle = Math.PI + (Math.PI * value) / 100
  return {
    x: 60 + radius * Math.cos(angle),
    y: 66 + radius * Math.sin(angle),
  }
}

function SpeedometerProgress({ progress }) {
  const normalized = Math.max(0, Math.min(100, Number(progress) || 0))
  const gradientId = `speedometer-gradient-${useId().replaceAll(':', '')}`
  const needlePoint = getSpeedometerPoint(normalized, 31)
  const status = progressLabel(normalized)

  return (
    <section className="speedometer-progress" aria-label={`Velocímetro da OM: ${normalized}% ${status}`}>
      <h4>Progresso da OM</h4>
      <div className="speedometer-chart">
        <svg viewBox="0 0 120 103" role="img" aria-hidden="true">
          <defs>
            <linearGradient id={gradientId} x1="16" y1="66" x2="104" y2="66" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#ECB11F" />
              <stop offset="0.58" stopColor="#F6BF34" />
              <stop offset="1" stopColor="#FFD86A" />
            </linearGradient>
          </defs>

          <path
            className="speedometer-track"
            d={SPEEDOMETER_PATH}
            pathLength="100"
          />
          {normalized > 0 && (
            <path
              className="speedometer-value"
              d={SPEEDOMETER_PATH}
              pathLength="100"
              stroke={`url(#${gradientId})`}
              strokeLinecap="round"
              style={{ strokeDasharray: `${normalized} 100` }}
            />
          )}

          <g className="speedometer-ticks">
            {SPEEDOMETER_TICKS.map((value) => {
              const innerPoint = getSpeedometerPoint(value, value % 50 === 0 ? 35.5 : 37.5)
              const outerPoint = getSpeedometerPoint(value, 43.5)
              return (
                <line
                  key={value}
                  className={value % 50 === 0 ? 'speedometer-tick is-major' : 'speedometer-tick'}
                  x1={innerPoint.x}
                  y1={innerPoint.y}
                  x2={outerPoint.x}
                  y2={outerPoint.y}
                />
              )
            })}
          </g>

          {SPEEDOMETER_LABELS.map((value) => {
            const point = getSpeedometerPoint(value, 51)
            return (
              <text
                key={value}
                className="speedometer-scale-label"
                x={point.x}
                y={point.y + (value === 50 ? 2 : 10)}
                textAnchor="middle"
              >
                {value}
              </text>
            )
          })}

          <line
            className="speedometer-needle"
            x1="60"
            y1="66"
            x2={needlePoint.x}
            y2={needlePoint.y}
          />
          <circle className="speedometer-hub-outer" cx="60" cy="66" r="5.2" />
          <circle className="speedometer-hub-inner" cx="60" cy="66" r="2.25" />

          <text className="speedometer-number" x="60" y="88" textAnchor="middle">
            {normalized}%
          </text>
          <text className="speedometer-status" x="60" y="99" textAnchor="middle">
            {status}
          </text>
        </svg>
      </div>
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
          <SpeedometerProgress progress={report.progress} />
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
