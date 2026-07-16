import {
  CheckCircle2,
  Download,
  FilePlus2,
  Images,
  LoaderCircle,
  Monitor,
  PencilLine,
} from 'lucide-react'

const saveLabels = {
  saved: 'Salvo agora',
  saving: 'Salvando…',
  error: 'Erro ao salvar',
}

export function AppHeader({
  site,
  slideCount,
  saveState,
  mobileView,
  onMobileViewChange,
  onNew,
  onExport,
  exportState,
}) {
  return (
    <>
      <header className="app-header liquid-surface">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true">RA</div>
          <div className="brand-copy">
            <h1>Destaques Semanais</h1>
            <p>{site || 'Unidade não informada'}</p>
          </div>
        </div>

        <div className="site-control" aria-label={`Unidade ${site || 'não informada'}, ${slideCount} ${slideCount === 1 ? 'slide' : 'slides'}`}>
          <span>{site || 'Unidade'}</span>
          <strong>{slideCount} {slideCount === 1 ? 'slide' : 'slides'}</strong>
        </div>

        <div className={`save-status save-${saveState}`} role="status">
          {saveState === 'saving' ? (
            <LoaderCircle className="spin" size={17} />
          ) : (
            <CheckCircle2 size={17} />
          )}
          <span>{saveLabels[saveState]}</span>
        </div>

        <div className="header-actions">
          <button className="button new-report-button" type="button" aria-label="Nova OM" onClick={onNew}>
            <span className="button-icon"><FilePlus2 size={19} /></span>
            <span>Nova OM</span>
          </button>
          <button
            className="button button-primary"
            type="button"
            aria-label="Exportar apresentação em PowerPoint 4K"
            onClick={onExport}
            disabled={exportState === 'pptx' || exportState === 'png'}
          >
            <Download size={19} />
            <span>{exportState === 'pptx' ? 'Gerando 4K…' : exportState === 'success' ? 'PPTX 4K pronto' : 'Exportar PPTX 4K'}</span>
          </button>
        </div>
      </header>

      <div className="mobile-view-switch liquid-surface" aria-label="Alternar visualização">
        <button
          type="button"
          className={mobileView === 'edit' ? 'is-active' : ''}
          onClick={() => onMobileViewChange('edit')}
        >
          <PencilLine size={17} />
          <span>Editar</span>
        </button>
        <button
          type="button"
          className={mobileView === 'preview' ? 'is-active' : ''}
          onClick={() => onMobileViewChange('preview')}
        >
          <Monitor size={17} />
          <span>Prévia</span>
        </button>
        <button
          type="button"
          className={mobileView === 'photos' ? 'is-active' : ''}
          onClick={() => onMobileViewChange('photos')}
        >
          <Images size={17} />
          <span>Fotos</span>
        </button>
      </div>
    </>
  )
}
