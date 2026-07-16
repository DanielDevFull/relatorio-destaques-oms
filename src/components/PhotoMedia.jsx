export function PhotoMedia({ photo, alt = '', className = '' }) {
  if (!photo) return <div className={`photo-placeholder ${className}`} aria-label="Foto não adicionada" />

  if (photo.type === 'crop') {
    return (
      <span className={`source-crop crop-${photo.crop} ${className}`} role="img" aria-label={alt}>
        <img src={photo.url} alt="" />
      </span>
    )
  }

  return <img className={className} src={photo.url} alt={alt} />
}
