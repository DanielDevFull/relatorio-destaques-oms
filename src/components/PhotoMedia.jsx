export function PhotoMedia({ photo, alt = '', className = '' }) {
  if (!photo) return <div className={`photo-placeholder ${className}`} aria-label="Foto não adicionada" />

  return <img className={className} src={photo.url} alt={alt} />
}
