import { useId } from 'react'
import { ArrowRight, CalendarDays, Clock3, Maximize2, ShieldCheck } from 'lucide-react'
import { REPORT_LOGO } from '../data.js'
import { formatDate, progressLabel } from '../utils/formatters.js'
import { PhotoMedia } from './PhotoMedia.jsx'

/* Velocímetro inspirado na referência do Figma (Speedometer, Community).
   Dela vêm a estrutura: anel de traços finos, arco grosso com gradiente,
   ponteiro afilado e cubo central proeminente.

   Duas adaptações deliberadas ao contexto:
   - O original é neon sobre preto. Aqui o slide é branco e é entregável de
     marca, então o gradiente usa a rampa Vale do estado. O brilho (glow) do
     original não foi reproduzido: sobre branco ele vira halo sujo, e é feito
     de blur — que arrisca a rasterização do PPTX.
   - Sem rótulos numéricos de escala. Eram eles que descentravam o desenho
     antigo ("100" puxava 2.1u à direita de "0"); só traços deixa a geometria
     simétrica por construção. */
const GAUGE = {
  cx: 120,
  cy: 120,
  radius: 86,
  tickCount: 41,
  needleLength: 58,
}

const GAUGE_RAMP = {
  idle: { from: '#9aa3a5', to: '#747678' },
  running: { from: '#ffc94a', to: '#ecb11f' },
  complete: { from: '#12a8a2', to: '#007e7a' },
}

/* Tudo que é visual aqui vai como ATRIBUTO SVG, não como CSS.
   O html-to-image rasteriza o nó fora da tela e as regras de classe não
   chegam nos filhos do SVG: `fill` volta ao padrão preto (o arco virava um
   semicírculo preenchido) e `stroke` ao padrão nenhum (os traços sumiam).
   Ponteiro e cubo já escapavam disso porque usavam atributos — agora todos
   usam. O CSS restante cuida só de transição e tipografia. */
const GAUGE_PAINT = {
  arcWidth: 15,
  track: '#e4eaeb',
  tick: '#b6c1c3',
  tickMajor: '#7d8b8d',
  ink: '#0d1c1e',
  inkMuted: '#5c6b6e',
}

// 0% aponta para a esquerda (180°) e 100% para a direita (360°).
function polar(radius, percent) {
  const angle = Math.PI + (Math.PI * percent) / 100
  return {
    x: GAUGE.cx + radius * Math.cos(angle),
    y: GAUGE.cy + radius * Math.sin(angle),
  }
}

function needlePoints(percent) {
  const tip = polar(GAUGE.needleLength, percent)
  const left = polar(4.6, percent + 50)
  const right = polar(4.6, percent - 50)
  return `${tip.x},${tip.y} ${left.x},${left.y} ${right.x},${right.y}`
}

const ARC_PATH = `M ${polar(GAUGE.radius, 0).x} ${GAUGE.cy}
  A ${GAUGE.radius} ${GAUGE.radius} 0 0 1 ${polar(GAUGE.radius, 100).x} ${GAUGE.cy}`

function SpeedometerProgress({ progress }) {
  const normalized = Math.max(0, Math.min(100, Number(progress) || 0))
  const status = progressLabel(normalized)
  const state = normalized >= 100 ? 'complete' : normalized > 0 ? 'running' : 'idle'
  const ramp = GAUGE_RAMP[state]
  const gradientId = `gauge-${useId().replaceAll(':', '')}`

  return (
    <section
      className={`gauge-progress is-${state}`}
      aria-label={`Progresso da OM: ${normalized}% ${status}`}
    >
      <h4>Progresso da OM</h4>
      <div className="gauge-chart">
        {/* viewBox simétrico em torno de x=120 por construção */}
        <svg viewBox="20 20 200 162" aria-hidden="true">
          <defs>
            <linearGradient id={gradientId} x1="34" y1="120" x2="206" y2="120" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor={ramp.from} />
              <stop offset="1" stopColor={ramp.to} />
            </linearGradient>
          </defs>

          <path
            className="gauge-track"
            d={ARC_PATH}
            pathLength="100"
            fill="none"
            stroke={GAUGE_PAINT.track}
            strokeWidth={GAUGE_PAINT.arcWidth}
            strokeLinecap="round"
          />
          {normalized > 0 ? (
            <path
              className="gauge-value"
              d={ARC_PATH}
              pathLength="100"
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth={GAUGE_PAINT.arcWidth}
              strokeLinecap="round"
              strokeDasharray={`${normalized} 100`}
            />
          ) : null}

          <g className="gauge-ticks">
            {Array.from({ length: GAUGE.tickCount }, (_, index) => {
              const value = (index / (GAUGE.tickCount - 1)) * 100
              const major = index % 10 === 0
              const inner = polar(major ? 58 : 64, value)
              const outer = polar(71, value)
              return (
                <line
                  key={value}
                  x1={inner.x}
                  y1={inner.y}
                  x2={outer.x}
                  y2={outer.y}
                  stroke={major ? GAUGE_PAINT.tickMajor : GAUGE_PAINT.tick}
                  strokeWidth={major ? 2.6 : 1.6}
                  strokeLinecap="round"
                />
              )
            })}
          </g>

          <polygon
            points={needlePoints(normalized)}
            fill={ramp.to}
            stroke="#ffffff"
            strokeWidth="1.1"
            strokeLinejoin="round"
          />
          <circle cx={GAUGE.cx} cy={GAUGE.cy} r="10.5" fill="#ffffff" stroke={ramp.to} strokeWidth="3.4" />
          <circle cx={GAUGE.cx} cy={GAUGE.cy} r="4.4" fill={ramp.to} />

          {/* Leitura abaixo do cubo, fora do semicírculo: o ponteiro varre
              todo o interior do arco, então qualquer texto ali seria
              atravessado por ele em algum valor. */}
          <text
            className="gauge-number"
            x={GAUGE.cx}
            y="157"
            textAnchor="middle"
            fill={GAUGE_PAINT.ink}
            fontSize="30"
            fontWeight="880"
          >
            {normalized}%
          </text>
          <text
            className="gauge-status"
            x={GAUGE.cx}
            y="175"
            textAnchor="middle"
            fill={GAUGE_PAINT.inkMuted}
            fontSize="12.5"
            fontWeight="800"
          >
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

export function ReportPreview({ report, deckTitle }) {
  const sameDate = report.startDate === report.endDate
  const periodValue = sameDate
    ? formatDate(report.startDate)
    : `${formatDate(report.startDate)} — ${formatDate(report.endDate)}`

  return (
    <article className="report-page" data-slide-id={report.id}>
      <header className="report-header">
        <div className="report-heading">
          <h2>{deckTitle || 'Report Bem Estar'}</h2>
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
