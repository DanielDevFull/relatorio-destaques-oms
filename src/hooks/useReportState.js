import { useCallback, useEffect, useRef, useState } from 'react'
import { defaultDeck, defaultReport, REPORT_LOGO } from '../data.js'
import { loadPresentation, savePresentation } from '../utils/presentationStorage.js'

const STORAGE_KEY = 'relatorio-premium:v5'
const LEGACY_STORAGE_KEYS = ['relatorio-premium:v4', 'relatorio-premium:v3']

function createSlideId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return `slide-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function normalizeReport(report = {}) {
  return {
    ...defaultReport,
    ...report,
    id: report.id || createSlideId(),
    logo: REPORT_LOGO,
    weekReference: report.weekReference ?? report.reportCode ?? defaultReport.weekReference,
    workOrder: report.workOrder ?? defaultReport.workOrder,
  }
}

// O report passou a se chamar "Bem Estar". Quem já usava tem o nome antigo
// gravado, que sobrepõe o padrão novo — então migra só esse valor exato,
// preservando qualquer título que o usuário tenha escrito.
const LEGACY_COVER_TITLE = 'Destaques Operacionais'

function normalizeDeck(deck) {
  const merged = { ...defaultDeck, ...(deck || {}) }
  if (merged.coverTitle === LEGACY_COVER_TITLE) merged.coverTitle = defaultDeck.coverTitle
  return merged
}

function loadInitialPresentation() {
  try {
    const storedPresentation = window.localStorage.getItem(STORAGE_KEY)
    if (storedPresentation) {
      const parsed = JSON.parse(storedPresentation)
      if (Array.isArray(parsed.slides) && parsed.slides.length > 0) {
        const slides = parsed.slides.map(normalizeReport)
        const activeSlideId = slides.some((slide) => slide.id === parsed.activeSlideId)
          ? parsed.activeSlideId
          : slides[0].id
        return { slides, activeSlideId, deck: normalizeDeck(parsed.deck) }
      }
    }

    const legacyValue = LEGACY_STORAGE_KEYS
      .map((key) => window.localStorage.getItem(key))
      .find(Boolean)
    const firstSlide = normalizeReport(legacyValue ? JSON.parse(legacyValue) : defaultReport)
    return {
      slides: [firstSlide],
      activeSlideId: firstSlide.id,
      deck: normalizeDeck(),
    }
  } catch {
    const firstSlide = normalizeReport(defaultReport)
    return { slides: [firstSlide], activeSlideId: firstSlide.id, deck: normalizeDeck() }
  }
}

function normalizePresentation(presentation) {
  if (!Array.isArray(presentation?.slides) || presentation.slides.length === 0) {
    const firstSlide = normalizeReport(defaultReport)
    return { slides: [firstSlide], activeSlideId: firstSlide.id, deck: normalizeDeck() }
  }

  const slides = presentation.slides.map(normalizeReport)
  return {
    slides,
    deck: normalizeDeck(presentation.deck),
    activeSlideId: slides.some((slide) => slide.id === presentation.activeSlideId)
      ? presentation.activeSlideId
      : slides[0].id,
  }
}

// As fotos importadas viram data URLs de vários MB e estouram a cota do
// localStorage (~5 MB) já no segundo slide. O IndexedDB guarda a apresentação
// completa; aqui fica só o texto, como fallback.
function withoutImportedPhoto(photo) {
  return photo && photo.type === 'data' ? '' : photo
}

function lightweightSnapshot(presentation) {
  return {
    ...presentation,
    slides: presentation.slides.map((slide) => ({
      ...slide,
      beforePhoto: withoutImportedPhoto(slide.beforePhoto),
      afterPhoto: withoutImportedPhoto(slide.afterPhoto),
    })),
  }
}

export function useReportState() {
  const [presentation, setPresentation] = useState(loadInitialPresentation)
  const [saveState, setSaveState] = useState('saved')
  const [isHydrated, setIsHydrated] = useState(false)
  const saveTimer = useRef(null)

  const activeReport = presentation.slides.find(
    (slide) => slide.id === presentation.activeSlideId,
  ) || presentation.slides[0]

  useEffect(() => {
    let cancelled = false
    loadPresentation()
      .then((storedPresentation) => {
        if (!cancelled && storedPresentation) {
          setPresentation(normalizePresentation(storedPresentation))
        }
      })
      .catch(() => {
        // O snapshot leve em localStorage continua como fallback.
      })
      .finally(() => {
        if (!cancelled) setIsHydrated(true)
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!isHydrated) return undefined
    window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(async () => {
      try {
        await savePresentation(presentation)
      } catch {
        setSaveState('error')
        return
      }

      // O IndexedDB já guardou a apresentação completa; o snapshot em
      // localStorage é best-effort e não deve derrubar o estado de salvo.
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lightweightSnapshot(presentation)))
      } catch {
        // Cota cheia ou modo privativo: o fallback fica desatualizado, só isso.
      }

      setSaveState('saved')
    }, 450)

    return () => window.clearTimeout(saveTimer.current)
  }, [isHydrated, presentation])

  const updateField = useCallback((field, value) => {
    setSaveState('saving')
    setPresentation((current) => ({
      ...current,
      slides: current.slides.map((slide) => (
        slide.id === current.activeSlideId ? { ...slide, [field]: value } : slide
      )),
    }))
  }, [])

  const updateDeckField = useCallback((field, value) => {
    setSaveState('saving')
    setPresentation((current) => ({
      ...current,
      deck: { ...normalizeDeck(current.deck), [field]: value },
    }))
  }, [])

  const selectReport = useCallback((slideId) => {
    setPresentation((current) => (
      current.activeSlideId === slideId
        ? current
        : { ...current, activeSlideId: slideId }
    ))
  }, [])

  const createNextReport = useCallback(() => {
    const newSlideId = createSlideId()
    setSaveState('saving')
    setPresentation((current) => {
      const source = current.slides.find((slide) => slide.id === current.activeSlideId)
        || current.slides[current.slides.length - 1]
      const nextSlide = normalizeReport({
        ...defaultReport,
        id: newSlideId,
        weekReference: source.weekReference,
        site: source.site,
        category: source.category,
        classification: source.classification,
        safety: source.safety,
        responsible: source.responsible,
        contractor: source.contractor,
        supervisor: source.supervisor,
        team: source.team,
        workOrder: '',
        activityTitle: '',
        location: '',
        description: '',
        impact: '',
        startDate: '',
        endDate: '',
        plannedHours: '',
        actualHours: '',
        area: '',
        progress: '100',
        beforePhoto: '',
        afterPhoto: '',
      })

      return {
        slides: [...current.slides, nextSlide],
        activeSlideId: newSlideId,
      }
    })
    return newSlideId
  }, [])

  const duplicateReport = useCallback((slideId) => {
    const duplicateId = createSlideId()
    setSaveState('saving')
    setPresentation((current) => {
      const sourceIndex = current.slides.findIndex((slide) => slide.id === slideId)
      if (sourceIndex < 0) return current
      const duplicate = { ...current.slides[sourceIndex], id: duplicateId }
      const slides = [...current.slides]
      slides.splice(sourceIndex + 1, 0, duplicate)
      return { slides, activeSlideId: duplicateId }
    })
    return duplicateId
  }, [])

  const removeReport = useCallback((slideId) => {
    setSaveState('saving')
    setPresentation((current) => {
      if (current.slides.length <= 1) return current
      const removedIndex = current.slides.findIndex((slide) => slide.id === slideId)
      if (removedIndex < 0) return current
      const slides = current.slides.filter((slide) => slide.id !== slideId)
      const fallback = slides[Math.min(removedIndex, slides.length - 1)]
      return {
        slides,
        activeSlideId: current.activeSlideId === slideId
          ? fallback.id
          : current.activeSlideId,
      }
    })
  }, [])

  return {
    slides: presentation.slides,
    activeSlideId: presentation.activeSlideId,
    report: activeReport,
    deck: normalizeDeck(presentation.deck),
    updateField,
    updateDeckField,
    selectReport,
    createNextReport,
    duplicateReport,
    removeReport,
    saveState,
  }
}
