import { useMemo, useState } from 'react'
import { AlertTriangle, Camera, Download, FileText, Monitor } from 'lucide-react'
import { AppHeader } from './components/AppHeader.jsx'
import { ClosingPage } from './components/ClosingPage.jsx'
import { CoverPage } from './components/CoverPage.jsx'
import { EditorPanel } from './components/EditorPanel.jsx'
import { PreviewToolbar } from './components/PreviewToolbar.jsx'
import { SlidePreviewItem } from './components/SlidePreviewItem.jsx'
import { useReportState } from './hooks/useReportState.js'
import { safeFileName } from './utils/formatters.js'
import { summarizePresentation } from './utils/summary.js'
import { downloadPresentationAsPptx, downloadSlideAsPng } from './utils/exportSlide.js'

const COVER_ID = '__cover__'
const CLOSING_ID = '__closing__'

function scrollToSlide(slideId) {
  window.requestAnimationFrame(() => {
    document.getElementById(`slide-preview-${slideId}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  })
}

export default function App() {
  const {
    slides,
    activeSlideId,
    report,
    deck,
    updateField,
    updateDeckField,
    selectReport,
    createNextReport,
    duplicateReport,
    removeReport,
    saveState,
  } = useReportState()
  const [mobileView, setMobileView] = useState('edit')
  const [editorSection, setEditorSection] = useState('data')
  const [zoom, setZoom] = useState(82)
  const [exportState, setExportState] = useState('idle')
  const [exportMessage, setExportMessage] = useState('')
  const [slideToDelete, setSlideToDelete] = useState(null)

  const activeIndex = Math.max(0, slides.findIndex((slide) => slide.id === activeSlideId))
  const summary = useMemo(() => summarizePresentation(slides), [slides])
  // A apresentação exportada é sempre capa + OMs + final.
  const deckSize = slides.length + 2

  function handleMobileViewChange(view) {
    setMobileView(view)
    if (view === 'edit') setEditorSection('data')
    if (view === 'photos') setEditorSection('photos')
  }

  function handleNewReport() {
    const slideId = createNextReport()
    setEditorSection('data')
    setMobileView('edit')
    scrollToSlide(slideId)
  }

  function handleDuplicateReport(slideId) {
    const duplicateId = duplicateReport(slideId)
    scrollToSlide(duplicateId)
  }

  function handleDeleteReport(slideId) {
    setSlideToDelete(slideId)
  }

  function handleConfirmDelete() {
    removeReport(slideToDelete)
    setSlideToDelete(null)
  }

  function presentationFileName() {
    return [
      slides[0]?.weekReference || 'semana',
      slides[0]?.site || 'unidade',
      'destaques-semanais',
    ].map(safeFileName).filter(Boolean).join('-')
  }

  function activeSlideFileName() {
    return [
      report.weekReference || 'semana',
      report.workOrder || 'om',
      report.activityTitle || 'destaque',
    ].map(safeFileName).filter(Boolean).join('-')
  }

  async function handleExportPptx() {
    if (exportState === 'pptx' || exportState === 'png') return
    setExportState('pptx')
    setExportMessage(`Preparando ${deckSize} slides 4K…`)
    try {
      await downloadPresentationAsPptx({
        slideIds: [COVER_ID, ...slides.map((slide) => slide.id), CLOSING_ID],
        title: summary.weekReference,
        fileName: presentationFileName(),
        onProgress: (completed, total) => setExportMessage(`Gerando slide ${completed} de ${total}…`),
      })
      setExportState('success')
      setExportMessage(`PowerPoint 4K pronto com ${deckSize} slides, incluindo capa e fecho.`)
      window.setTimeout(() => {
        setExportState('idle')
        setExportMessage('')
      }, 2800)
    } catch (error) {
      console.error(error)
      setExportState('error')
      setExportMessage('Não foi possível gerar o PowerPoint. Tente novamente.')
      window.setTimeout(() => {
        setExportState('idle')
        setExportMessage('')
      }, 3800)
    }
  }

  async function handleExportImage() {
    if (exportState === 'pptx' || exportState === 'png') return
    setExportState('png')
    setExportMessage(`Gerando PNG 4K do slide ${activeIndex + 1}…`)
    try {
      await downloadSlideAsPng(activeSlideFileName(), activeSlideId)
      setExportState('success')
      setExportMessage('PNG 4K do slide selecionado pronto.')
      window.setTimeout(() => {
        setExportState('idle')
        setExportMessage('')
      }, 2200)
    } catch (error) {
      console.error(error)
      setExportState('error')
      setExportMessage('Não foi possível gerar o PNG. Tente novamente.')
      window.setTimeout(() => {
        setExportState('idle')
        setExportMessage('')
      }, 3200)
    }
  }

  return (
    <div className="app-shell">
      <AppHeader
        site={report.site}
        slideCount={deckSize}
        saveState={saveState}
        mobileView={mobileView}
        onMobileViewChange={handleMobileViewChange}
        onNew={handleNewReport}
        onExport={handleExportPptx}
        exportState={exportState}
      />
      <main className={`workspace mobile-${mobileView}`}>
        <EditorPanel
          report={report}
          updateField={updateField}
          deck={deck}
          updateDeckField={updateDeckField}
          summary={summary}
          activeSection={editorSection}
          onSectionChange={setEditorSection}
          slideNumber={activeIndex + 1}
          slideCount={slides.length}
        />
        <section className="preview-workspace" aria-label="Pré-visualização da apresentação semanal">
          <PreviewToolbar
            zoom={zoom}
            slideCount={deckSize}
            onZoomChange={setZoom}
            onExportPptx={handleExportPptx}
            onExportImage={handleExportImage}
            exportState={exportState}
          />
          <div className="report-stage" style={{ '--report-zoom': zoom / 100 }}>
            <SlidePreviewItem
              label="Capa"
              isActive={editorSection === 'deck'}
              onSelect={() => setEditorSection('deck')}
            >
              <CoverPage deck={deck} summary={summary} />
            </SlidePreviewItem>

            {slides.map((slide, index) => (
              <SlidePreviewItem
                key={slide.id}
                report={slide}
                index={index}
                isActive={slide.id === activeSlideId}
                canDelete={slides.length > 1}
                deckTitle={deck.coverTitle}
                onSelect={() => selectReport(slide.id)}
                onDuplicate={() => handleDuplicateReport(slide.id)}
                onDelete={() => handleDeleteReport(slide.id)}
              />
            ))}

            <SlidePreviewItem
              label="Fecho"
              isActive={editorSection === 'deck'}
              onSelect={() => setEditorSection('deck')}
            >
              <ClosingPage deck={deck} summary={summary} />
            </SlidePreviewItem>
          </div>
          <button
            className="mobile-export-button"
            type="button"
            onClick={handleExportPptx}
            disabled={exportState === 'pptx' || exportState === 'png'}
          >
            <Download size={20} />
            {exportState === 'pptx' ? 'Gerando PowerPoint 4K…' : `Baixar PowerPoint 4K · ${deckSize} slides`}
          </button>
        </section>
      </main>
      <nav className="mobile-tabbar" aria-label="Navegação do relatório">
        <button
          type="button"
          className={mobileView === 'edit' ? 'is-active' : ''}
          onClick={() => handleMobileViewChange('edit')}
        >
          <FileText size={20} />
          <span>Dados</span>
        </button>
        <button
          type="button"
          className={mobileView === 'preview' ? 'is-active' : ''}
          onClick={() => handleMobileViewChange('preview')}
        >
          <Monitor size={20} />
          <span>Prévia</span>
        </button>
        <button
          type="button"
          className={mobileView === 'photos' ? 'is-active' : ''}
          onClick={() => handleMobileViewChange('photos')}
        >
          <Camera size={20} />
          <span>Fotos</span>
        </button>
      </nav>
      {exportMessage ? (
        <div className={`export-toast export-${exportState}`} role="status" aria-live="polite">
          {exportMessage}
        </div>
      ) : null}
      {slideToDelete ? (
        <div className="dialog-backdrop" role="presentation" onMouseDown={() => setSlideToDelete(null)}>
          <section
            className="confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-slide-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <span className="dialog-icon"><AlertTriangle size={22} /></span>
            <div>
              <h2 id="delete-slide-title">Excluir este slide?</h2>
              <p>Apenas esta OM será removida. Os demais slides da apresentação semanal permanecerão salvos.</p>
            </div>
            <div className="dialog-actions">
              <button className="button button-secondary" type="button" onClick={() => setSlideToDelete(null)}>
                Cancelar
              </button>
              <button className="button button-danger" type="button" onClick={handleConfirmDelete}>
                Excluir slide
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}
