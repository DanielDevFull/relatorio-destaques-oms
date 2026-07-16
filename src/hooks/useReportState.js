import { useCallback, useEffect, useRef, useState } from 'react'
import { defaultReport, REPORT_LOGO } from '../data.js'
import {
  clearPresentation,
  loadPresentation,
  savePresentation,
} from '../utils/presentationStorage.js'

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
        return { slides, activeSlideId }
      }
    }

    const legacyValue = LEGACY_STORAGE_KEYS
      .map((key) => window.localStorage.getItem(key))
      .find(Boolean)
    const firstSlide = normalizeReport(legacyValue ? JSON.parse(legacyValue) : defaultReport)
    return {
      slides: [firstSlide],
      activeSlideId: firstSlide.id,
    }
  } catch {
    const firstSlide = normalizeReport(defaultReport)
    return { slides: [firstSlide], activeSlideId: firstSlide.id }
  }
}

function normalizePresentation(presentation) {
  if (!Array.isArray(presentation?.slides) || presentation.slides.length === 0) {
    const firstSlide = normalizeReport(defaultReport)
    return { slides: [firstSlide], activeSlideId: firstSlide.id }
  }

  const slides = presentation.slides.map(normalizeReport)
  return {
    slides,
    activeSlideId: slides.some((slide) => slide.id === presentation.activeSlideId)
      ? presentation.activeSlideId
      : slides[0].id,
  }
}

function lightweightSnapshot(presentation) {
  return {
    ...presentation,
    slides: presentation.slides.map((slide) => ({
      ...slide,
      beforePhoto: typeof slide.beforePhoto === 'string' ? '' : slide.beforePhoto,
      afterPhoto: typeof slide.afterPhoto === 'string' ? '' : slide.afterPhoto,
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
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lightweightSnapshot(presentation)))
        setSaveState('saved')
      } catch {
        setSaveState('error')
      }
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

  const selectReport = useCallback((slideId) => {
    setPresentation((current) => (
      current.activeSlideId === slideId
        ? current
        : { ...current, activeSlideId: slideId }
    ))
  }, [])

  const resetPresentation = useCallback(() => {
    const firstSlide = normalizeReport(defaultReport)
    setSaveState('saving')
    setPresentation({ slides: [firstSlide], activeSlideId: firstSlide.id })
    window.localStorage.removeItem(STORAGE_KEY)
    LEGACY_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key))
    clearPresentation().catch(() => {})
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
    updateField,
    selectReport,
    resetPresentation,
    createNextReport,
    duplicateReport,
    removeReport,
    saveState,
  }
}
