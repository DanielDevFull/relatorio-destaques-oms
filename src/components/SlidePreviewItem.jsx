import { CopyPlus, PencilLine, Trash2 } from 'lucide-react'
import { ReportPreview } from './ReportPreview.jsx'

export function SlidePreviewItem({
  report,
  index,
  isActive,
  canDelete,
  onSelect,
  onDuplicate,
  onDelete,
}) {
  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelect()
    }
  }

  return (
    <section
      className={`slide-preview-item${isActive ? ' is-active' : ''}`}
      id={`slide-preview-${report.id}`}
      aria-label={`Slide ${index + 1}: ${report.workOrder || 'nova OM'}`}
    >
      <div className="slide-preview-command liquid-surface">
        <button className="slide-select-button" type="button" onClick={onSelect} aria-current={isActive ? 'true' : undefined}>
          <span>Slide {String(index + 1).padStart(2, '0')}</span>
          <strong>{report.workOrder || 'Nova OM'}</strong>
          {isActive ? <em><PencilLine size={13} /> Editando</em> : null}
        </button>
        <div className="slide-command-actions">
          <button type="button" onClick={onDuplicate} aria-label={`Duplicar slide ${index + 1}`} title="Duplicar slide">
            <CopyPlus size={16} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Excluir slide ${index + 1}`}
            title={canDelete ? 'Excluir slide' : 'A apresentação precisa ter ao menos um slide'}
            disabled={!canDelete}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <div
        className="slide-canvas"
        role="button"
        tabIndex="0"
        aria-label={`Selecionar slide ${index + 1} para edição`}
        onClick={onSelect}
        onKeyDown={handleKeyDown}
      >
        <ReportPreview report={report} />
      </div>
    </section>
  )
}
