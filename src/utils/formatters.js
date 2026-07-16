export function formatDate(value) {
  if (!value) return '—'
  const [year, month, day] = value.split('-')
  if (!year || !month || !day) return value
  return `${day}/${month}/${year.slice(-2)}`
}

export function progressLabel(progress) {
  return Number(progress) >= 100 ? 'Concluído' : Number(progress) > 0 ? 'Em andamento' : 'Não iniciado'
}

export function safeFileName(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .toLowerCase()
}
