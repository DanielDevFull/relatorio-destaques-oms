import { ImagePlus, Replace, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { readImageFile } from '../utils/images.js'
import { PhotoMedia } from './PhotoMedia.jsx'

export function PhotoField({ label, value, onChange }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(file) {
    if (!file) return
    try {
      setError('')
      onChange(await readImageFile(file))
    } catch (fileError) {
      setError(fileError.message)
    }
  }

  function handleDrop(event) {
    event.preventDefault()
    setDragging(false)
    handleFile(event.dataTransfer.files?.[0])
  }

  return (
    <div className="photo-field">
      <div className="photo-label-row">
        <span>{label}</span>
        {value ? (
          <button type="button" onClick={() => onChange('')} aria-label={`Remover foto ${label}`}>
            <Trash2 size={14} />
          </button>
        ) : null}
      </div>
      <button
        type="button"
        className={`photo-dropzone ${dragging ? 'is-dragging' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        {value ? (
          <>
            <PhotoMedia photo={value} alt={`Foto ${label}`} />
            <span className="photo-replace"><Replace size={15} /> Substituir</span>
          </>
        ) : (
          <span className="photo-empty">
            <span><ImagePlus size={24} /></span>
            <strong>Adicionar foto</strong>
            <small>JPG, PNG ou WEBP · alta resolução</small>
          </span>
        )}
      </button>
      <input
        ref={inputRef}
        className="visually-hidden"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
      {error ? <small className="field-error">{error}</small> : null}
    </div>
  )
}
