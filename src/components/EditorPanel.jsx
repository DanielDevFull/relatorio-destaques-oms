import {
  Building2,
  Camera,
  Images,
  Info,
  Presentation,
  ShieldCheck,
  UploadCloud,
  UsersRound,
} from 'lucide-react'
import { classificationOptions, progressOptions } from '../data.js'
import {
  Field,
  InputWithSuffix,
  SelectInput,
  TextArea,
  TextInput,
} from './FormControls.jsx'
import { PhotoField } from './PhotoField.jsx'
import { PhotoMedia } from './PhotoMedia.jsx'
import { REPORT_LOGO } from '../data.js'

const sections = [
  { id: 'data', label: 'OM' },
  { id: 'photos', label: 'Fotos' },
  { id: 'team', label: 'Equipe' },
  { id: 'deck', label: 'Capa' },
]

function SectionHeading({ icon: Icon, title, subtitle }) {
  return (
    <div className="panel-section-heading">
      <span className="panel-heading-icon"><Icon size={17} /></span>
      <span>
        <strong>{title}</strong>
        {subtitle ? <small>{subtitle}</small> : null}
      </span>
    </div>
  )
}

function CompactPhotoStrip({ report, onOpenPhotos }) {
  return (
    <section className="compact-photo-section">
      <div className="compact-photo-heading">
        <span>Antes e depois</span>
        <button type="button" onClick={onOpenPhotos}>Gerenciar</button>
      </div>
      <div className="compact-photo-grid">
        <figure>
          <figcaption>Antes</figcaption>
          <PhotoMedia photo={report.beforePhoto} alt="Foto antes da atividade" />
        </figure>
        <figure>
          <figcaption>Depois</figcaption>
          <PhotoMedia photo={report.afterPhoto} alt="Foto depois da atividade" />
        </figure>
      </div>
      <button className="compact-upload-button" type="button" onClick={onOpenPhotos}>
        <UploadCloud size={17} />
        Substituir fotos
      </button>
    </section>
  )
}

function DataSection({ report, updateField, onOpenPhotos }) {
  return (
    <>
      <SectionHeading icon={Info} title="Dados da OM" subtitle="Destaque semanal para apresentação" />
      <div className="field-grid field-grid-2">
        <Field label="Semana de referência" required>
          <TextInput
            value={report.weekReference}
            onChange={(value) => updateField('weekReference', value)}
            placeholder="Ex.: S14"
            maxLength="12"
          />
        </Field>
        <Field label="Número da OM" required>
          <TextInput
            value={report.workOrder}
            onChange={(value) => updateField('workOrder', value)}
            placeholder="Ex.: OM 458921"
            maxLength="24"
          />
        </Field>
      </div>
      <Field label="Título da atividade" required>
        <TextInput
          value={report.activityTitle}
          onChange={(value) => updateField('activityTitle', value)}
          placeholder="Ex.: Pintura interna da cabine 03"
          maxLength="72"
        />
      </Field>
      <Field label="Local / área" required>
        <TextInput
          value={report.location}
          onChange={(value) => updateField('location', value)}
          placeholder="Ex.: Usina ITLO • Silo de carregamento"
          maxLength="90"
        />
      </Field>
      <Field label="Classificação" required>
        <SelectInput value={report.classification} onChange={(value) => updateField('classification', value)}>
          {classificationOptions.map((option) => <option key={option} value={option}>{option}</option>)}
        </SelectInput>
      </Field>
      <Field label="Impacto da entrega" required>
        <TextInput
          value={report.impact}
          onChange={(value) => updateField('impact', value)}
          placeholder="Ex.: Segurança e conservação do ativo"
          maxLength="120"
        />
      </Field>
      <Field label="Resumo executivo" required hint="Priorize a mensagem principal para leitura em TV — até 220 caracteres.">
        <TextArea
          rows="3"
          value={report.description}
          onChange={(value) => updateField('description', value)}
          placeholder="Descreva a entrega realizada e seu resultado."
          maxLength="220"
        />
      </Field>
      <div className="field-grid field-grid-2">
        <Field label="Data inicial" required>
          <TextInput type="date" value={report.startDate} onChange={(value) => updateField('startDate', value)} />
        </Field>
        <Field label="Data final" required>
          <TextInput type="date" value={report.endDate} onChange={(value) => updateField('endDate', value)} />
        </Field>
      </div>
      <div className="field-grid field-grid-3">
        <Field label="Horas previstas" required>
          <InputWithSuffix
            type="number"
            min="0"
            value={report.plannedHours}
            onChange={(value) => updateField('plannedHours', value)}
            suffix="h"
          />
        </Field>
        <Field label="Horas realizadas" required>
          <InputWithSuffix
            type="number"
            min="0"
            value={report.actualHours}
            onChange={(value) => updateField('actualHours', value)}
            suffix="h"
          />
        </Field>
        <Field label="Área realizada" required>
          <InputWithSuffix
            inputMode="decimal"
            value={report.area}
            onChange={(value) => updateField('area', value)}
            suffix="m²"
          />
        </Field>
      </div>
      <div className="field-grid field-grid-1">
        <Field label="Status" required>
          <SelectInput value={report.progress} onChange={(value) => updateField('progress', value)}>
            {progressOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </SelectInput>
        </Field>
      </div>
      <CompactPhotoStrip report={report} onOpenPhotos={onOpenPhotos} />
    </>
  )
}

function PhotosSection({ report, updateField }) {
  return (
    <>
      <SectionHeading
        icon={Images}
        title="Antes e depois"
        subtitle="Use fotos originais; o exportador preserva até 3200 px."
      />
      <div className="photo-grid photo-grid-editor">
        <PhotoField
          label="Antes"
          value={report.beforePhoto}
          onChange={(value) => updateField('beforePhoto', value)}
        />
        <PhotoField
          label="Depois"
          value={report.afterPhoto}
          onChange={(value) => updateField('afterPhoto', value)}
        />
      </div>
      <div className="photo-guidance">
        <Camera size={18} />
        <p><strong>Dica de enquadramento</strong>Fotografe do mesmo ângulo e mantenha o local bem iluminado.</p>
      </div>
    </>
  )
}

function TeamSection({ report, updateField }) {
  return (
    <>
      <SectionHeading icon={UsersRound} title="Equipe e segurança" />
      <Field label="Responsável">
        <TextInput value={report.responsible} onChange={(value) => updateField('responsible', value)} maxLength="50" />
      </Field>
      <Field label="Empresa executora">
        <TextInput value={report.contractor} onChange={(value) => updateField('contractor', value)} maxLength="70" />
      </Field>
      <div className="field-grid field-grid-2">
        <Field label="Supervisor">
          <TextInput value={report.supervisor} onChange={(value) => updateField('supervisor', value)} maxLength="50" />
        </Field>
        <Field label="Equipe">
          <TextInput value={report.team} onChange={(value) => updateField('team', value)} maxLength="70" />
        </Field>
      </div>
      <Field label="Indicador de segurança">
        <span className="input-icon-wrap">
          <ShieldCheck size={17} />
          <TextInput value={report.safety} onChange={(value) => updateField('safety', value)} maxLength="50" />
        </span>
      </Field>

      <SectionHeading icon={Building2} title="Identidade do relatório" subtitle="Unidade, linha de serviço e marca oficial" />
      <Field label="Unidade">
        <TextInput value={report.site} onChange={(value) => updateField('site', value)} maxLength="50" />
      </Field>
      <Field label="Linha de serviço">
        <TextInput value={report.category} onChange={(value) => updateField('category', value)} maxLength="90" />
      </Field>
      <div className="single-logo-card" aria-label="Logo oficial do relatório">
        <img src={REPORT_LOGO} alt="Grupo GPS e GRSA" />
        <span><strong>Logo oficial</strong>Grupo GPS + GRSA</span>
      </div>
    </>
  )
}

function DeckSection({ deck, updateDeckField, summary }) {
  return (
    <>
      <SectionHeading
        icon={Presentation}
        title="Capa e fecho"
        subtitle="Geradas automaticamente — os números somam das OMs."
      />
      <Field label="Título da capa">
        <TextInput
          value={deck.coverTitle}
          onChange={(value) => updateDeckField('coverTitle', value)}
          placeholder="Ex.: Destaques Operacionais"
          maxLength="46"
        />
      </Field>
      <Field label="Subtítulo da capa" hint="Vazio usa a linha de serviço das OMs.">
        <TextInput
          value={deck.coverSubtitle}
          onChange={(value) => updateDeckField('coverSubtitle', value)}
          placeholder={summary.category || 'Serviços Operacionais'}
          maxLength="70"
        />
      </Field>

      <SectionHeading icon={ShieldCheck} title="Página final" />
      <Field label="Título do fecho">
        <TextInput
          value={deck.closingTitle}
          onChange={(value) => updateDeckField('closingTitle', value)}
          placeholder="Ex.: Resumo da Semana"
          maxLength="46"
        />
      </Field>
      <Field label="Mensagem de encerramento">
        <TextInput
          value={deck.closingMessage}
          onChange={(value) => updateDeckField('closingMessage', value)}
          placeholder="Ex.: Obrigado"
          maxLength="40"
        />
      </Field>

      <div className="deck-summary-preview" aria-label="Consolidado calculado">
        <strong>Consolidado atual</strong>
        <span>{summary.omCount} {summary.omCount === 1 ? 'OM' : 'OMs'} · {summary.completedCount} concluída{summary.completedCount === 1 ? '' : 's'}</span>
        <span>Horas: {summary.actualHours} realizadas / {summary.plannedHours} previstas</span>
        <span>Área somada: {summary.area} m²</span>
      </div>
    </>
  )
}

export function EditorPanel({
  report,
  updateField,
  deck,
  updateDeckField,
  summary,
  activeSection,
  onSectionChange,
  slideNumber,
  slideCount,
}) {
  return (
    <aside className="editor-panel liquid-surface" aria-label="Editor do relatório">
      <div className="editor-tabs" role="tablist" aria-label="Seções do editor">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            role="tab"
            aria-selected={activeSection === section.id}
            className={activeSection === section.id ? 'is-active' : ''}
            onClick={() => onSectionChange(section.id)}
          >
            {section.label}
          </button>
        ))}
      </div>
      <div className="editor-slide-context">
        <span>Editando slide {slideNumber} de {slideCount}</span>
        <strong>{report.workOrder || 'Nova OM'}</strong>
      </div>
      <div className="editor-content" role="tabpanel">
        {activeSection === 'data' ? (
          <DataSection report={report} updateField={updateField} onOpenPhotos={() => onSectionChange('photos')} />
        ) : null}
        {activeSection === 'photos' ? <PhotosSection report={report} updateField={updateField} /> : null}
        {activeSection === 'team' ? <TeamSection report={report} updateField={updateField} /> : null}
        {activeSection === 'deck' ? (
          <DeckSection deck={deck} updateDeckField={updateDeckField} summary={summary} />
        ) : null}
      </div>
    </aside>
  )
}
