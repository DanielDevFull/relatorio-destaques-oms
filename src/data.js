export const REPORT_LOGO = '/assets/logo-grupo-gps-grsa.svg'

export const defaultReport = {
  weekReference: 'S14',
  workOrder: 'OM 458921',
  site: 'Serra Sul',
  category: 'Serviços Operacionais • Manutenção Predial',
  classification: 'Manutenção predial',
  activityTitle: 'Pintura interna da cabine 03',
  location: 'Usina ITLO • Silo de carregamento',
  description:
    'Pintura interna da cabine 03 do silo de carregamento concluída com sucesso conforme padrões corporativos.',
  impact: 'Segurança e conservação do ativo e melhor ambiente de trabalho.',
  startDate: '2026-04-07',
  endDate: '2026-04-07',
  plannedHours: '16',
  actualHours: '16',
  area: '38,24',
  progress: '100',
  safety: 'Zero acidente',
  responsible: 'Maykel Teles',
  contractor: 'GRSA Manutenção Predial',
  supervisor: 'Jeciel Venâncio',
  team: 'Equipe de manutenção predial',
  logo: REPORT_LOGO,
  beforePhoto: { type: 'static', url: '/assets/before-example.jpg' },
  afterPhoto: { type: 'static', url: '/assets/after-example.jpg' },
}

// Textos da capa e da página final. Vivem no nível da apresentação, não do
// slide: são uma capa e uma final por deck, e os números delas são somados
// das OMs (ver utils/summary.js).
export const defaultDeck = {
  coverTitle: 'Report Bem Estar',
  coverSubtitle: '',
  closingTitle: 'Resumo da Semana',
  closingMessage: 'Obrigado',

  // Equipe da capa. Ficam vazios de propósito: o repositório é público e
  // nomes de pessoas não entram no código — preencha no app, que os dados
  // ficam só no seu navegador. Preposto e supervisor caem para o Fiscal e o
  // Supervisor das OMs quando não preenchidos.
  preposto: '',
  coordPlan: '',
  planner: '',
  deckSupervisor: '',
}

export const classificationOptions = [
  'Manutenção predial',
  'Manutenção civil',
  'Elétrica',
  'Mecânica',
  'Segurança',
  'Melhoria operacional',
]

export const progressOptions = [
  { value: '0', label: '0% Não iniciado' },
  { value: '25', label: '25% Em andamento' },
  { value: '50', label: '50% Em andamento' },
  { value: '75', label: '75% Em andamento' },
  { value: '100', label: '100% Concluído' },
]
