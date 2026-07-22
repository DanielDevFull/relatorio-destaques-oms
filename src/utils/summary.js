/* Consolidação dos slides de OM para a capa e a página final.

   O cuidado central aqui é numérico: os campos são digitados em formato
   brasileiro ("38,24", eventualmente "1.234,56"). Somar isso direto produz
   NaN ou concatenação, então a conversão é explícita — e trata os dois
   formatos que aparecem na prática. */

function toNumber(value) {
  const text = String(value ?? '').trim()
  if (!text) return 0

  // Com vírgula é pt-BR: ponto é milhar, vírgula é decimal (1.234,56).
  // Sem vírgula, um ponto só pode ser decimal (16.5) — não o descarte.
  const normalized = text.includes(',')
    ? text.replace(/\./g, '').replace(',', '.')
    : text

  const parsed = Number.parseFloat(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

export function formatAmount(value) {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(value)
}

function firstFilled(slides, field) {
  return slides.map((slide) => slide[field]).find((value) => value && String(value).trim()) || ''
}

function dateRange(slides) {
  const dates = slides
    .flatMap((slide) => [slide.startDate, slide.endDate])
    .filter(Boolean)
    .sort()

  return { start: dates[0] || '', end: dates[dates.length - 1] || '' }
}

export function summarizePresentation(slides = []) {
  const period = dateRange(slides)

  return {
    omCount: slides.length,
    completedCount: slides.filter((slide) => toNumber(slide.progress) >= 100).length,
    actualHours: slides.reduce((total, slide) => total + toNumber(slide.actualHours), 0),
    plannedHours: slides.reduce((total, slide) => total + toNumber(slide.plannedHours), 0),
    area: slides.reduce((total, slide) => total + toNumber(slide.area), 0),
    periodStart: period.start,
    periodEnd: period.end,
    weekReference: firstFilled(slides, 'weekReference'),
    site: firstFilled(slides, 'site'),
    category: firstFilled(slides, 'category'),
    safety: firstFilled(slides, 'safety'),
    responsible: firstFilled(slides, 'responsible'),
    supervisor: firstFilled(slides, 'supervisor'),
    contractor: firstFilled(slides, 'contractor'),
    team: firstFilled(slides, 'team'),
  }
}
