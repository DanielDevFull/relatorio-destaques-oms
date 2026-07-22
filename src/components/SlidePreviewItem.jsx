import { CopyPlus, PencilLine, Trash2 } from 'lucide-react'
import { ReportPreview } from './ReportPreview.jsx'

/* Serve a dois casos:
   - slide de OM: recebe `report` e os controles de duplicar/excluir;
   - capa e fecho: recebem `label` + `children`, sem esses controles, porque
     são automáticos — um de cada, sempre nas pontas da apresentação. */
export function SlidePreviewItem({
  report,
  index,
  isActive,
  canDelete,
  onSelect,
  onDuplicate,
  onDelete,
  label,
  children,
}) {
  const isDeckPage = Boolean(children)
  const domId = isDeckPage ? `slide-preview-${label}` : `slide-preview-${report.id}`

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelect()
    }
  }

  return (
    <section
      className={`slide-preview-item${isActive ? ' is-active' : ''}`}
      id={domId}
      aria-label={isDeckPage ? label : `Slide ${index + 1}: ${report.workOrder || 'nova OM'}`}
    >
      <div className="slide-preview-command liquid-surface">
        <button className="slide-select-button" type="button" onClick={onSelect} aria-current={isActive ? 'true' : undefined}>
          <span>{isDeckPage ? label : `Slide ${String(index + 1).padStart(2, '0')}`}</span>
          <strong>{isDeckPage ? 'Gerada da apresentação' : (report.workOrder || 'Nova OM')}</strong>
          {isActive ? <em><PencilLine size={13} /> Editando</em> : null}
        </button>
        {isDeckPage ? null : (
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
        )}
      </div>
      <div
        className="slide-canvas"
        role="button"
        tabIndex="0"
        aria-label={isDeckPage ? `Editar ${label}` : `Selecionar slide ${index + 1} para edição`}
        onClick={onSelect}
        onKeyDown={handleKeyDown}
      >
        {isDeckPage ? children : <ReportPreview report={report} />}
      </div>
    </section>
  )
}
