const MAX_DIMENSION = 3200
const JPEG_QUALITY = 0.94

export function readImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file?.type?.startsWith('image/')) {
      reject(new Error('Selecione um arquivo de imagem.'))
      return
    }

    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'))
    reader.onload = () => {
      const image = new Image()
      image.onerror = () => reject(new Error('A imagem selecionada é inválida.'))
      image.onload = () => {
        const scale = Math.min(1, MAX_DIMENSION / Math.max(image.width, image.height))
        const width = Math.round(image.width * scale)
        const height = Math.round(image.height * scale)
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const context = canvas.getContext('2d')
        context.imageSmoothingEnabled = true
        context.imageSmoothingQuality = 'high'
        context.drawImage(image, 0, 0, width, height)
        resolve({
          type: 'data',
          url: canvas.toDataURL('image/jpeg', JPEG_QUALITY),
          name: file.name,
        })
      }
      image.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}
