import { REPORT_LOGO } from '../data.js'

const EXPORT_WIDTH = 3840
const EXPORT_HEIGHT = 2160
const PPTX_WIDTH = 13.333
const PPTX_HEIGHT = 7.5

async function waitForSlideAssets(node) {
  if (document.fonts?.ready) await document.fonts.ready

  const images = [...node.querySelectorAll('img')]
  await Promise.all(images.map(async (image) => {
    if (!image.complete) {
      await new Promise((resolve) => {
        image.addEventListener('load', resolve, { once: true })
        image.addEventListener('error', resolve, { once: true })
      })
    }

    if (image.decode) {
      try {
        await image.decode()
      } catch {
        // A imagem já pode estar renderizada mesmo quando decode() não é suportado.
      }
    }
  }))
}

function findSlideNode(slideId) {
  return [...document.querySelectorAll('.report-page[data-slide-id]')]
    .find((node) => node.dataset.slideId === slideId)
}

async function renderSlideAsPng(node, toPng, { hideLogo = false } = {}) {
  const exportSurface = document.createElement('div')
  exportSurface.className = 'export-render-surface'
  const exportNode = node.cloneNode(true)
  exportNode.removeAttribute('data-slide-id')

  if (hideLogo) {
    const logo = exportNode.querySelector('.report-logo')
    if (logo) logo.style.visibility = 'hidden'
  }

  exportSurface.appendChild(exportNode)
  document.body.appendChild(exportSurface)

  try {
    await waitForSlideAssets(exportNode)
    return await toPng(exportNode, {
      backgroundColor: '#ffffff',
      cacheBust: true,
      canvasWidth: EXPORT_WIDTH,
      canvasHeight: EXPORT_HEIGHT,
      pixelRatio: 1,
      style: {
        border: '0',
        borderRadius: '0',
        boxShadow: 'none',
      },
    })
  } finally {
    exportSurface.remove()
  }
}

function getPptxElementBox(slideNode, selector) {
  const element = slideNode.querySelector(selector)
  if (!element) return null

  const slideRect = slideNode.getBoundingClientRect()
  const elementRect = element.getBoundingClientRect()
  if (!slideRect.width || !slideRect.height) return null

  return {
    x: ((elementRect.left - slideRect.left) / slideRect.width) * PPTX_WIDTH,
    y: ((elementRect.top - slideRect.top) / slideRect.height) * PPTX_HEIGHT,
    w: (elementRect.width / slideRect.width) * PPTX_WIDTH,
    h: (elementRect.height / slideRect.height) * PPTX_HEIGHT,
  }
}

async function loadSvgAsDataUrl(path) {
  const response = await fetch(path, { cache: 'force-cache' })
  if (!response.ok) throw new Error('Não foi possível carregar a logo SVG oficial.')

  const svg = await response.text()
  const blob = new Blob([svg], { type: 'image/svg+xml' })

  return await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => resolve(reader.result), { once: true })
    reader.addEventListener('error', () => reject(reader.error), { once: true })
    reader.readAsDataURL(blob)
  })
}

export async function downloadSlideAsPng(fileName, slideId) {
  const slide = findSlideNode(slideId)
  if (!slide) throw new Error('Prévia do slide não encontrada.')

  const { toPng } = await import('html-to-image')
  const dataUrl = await renderSlideAsPng(slide, toPng)

  const link = document.createElement('a')
  link.download = `${fileName}.png`
  link.href = dataUrl
  link.click()
}

export async function downloadPresentationAsPptx({ slides, fileName, onProgress }) {
  if (!slides.length) throw new Error('Nenhum slide disponível para exportação.')

  const [{ toPng }, pptxModule] = await Promise.all([
    import('html-to-image'),
    import('pptxgenjs'),
  ])
  const PptxGenJS = pptxModule.default
  const pptx = new PptxGenJS()

  pptx.layout = 'LAYOUT_WIDE'
  pptx.author = 'GRSA Manutenção Predial'
  pptx.company = 'Grupo GPS | GRSA'
  pptx.subject = 'Resumo semanal das principais OMs executadas — imagens 4K lossless'
  pptx.title = `Destaques semanais — ${slides[0].weekReference || 'Semana'}`
  pptx.lang = 'pt-BR'
  pptx.theme = {
    headFontFace: 'Nunito',
    bodyFontFace: 'Nunito',
    lang: 'pt-BR',
  }

  let logoSvgData = null
  try {
    logoSvgData = await loadSvgAsDataUrl(REPORT_LOGO)
  } catch {
    // A captura 4K mantém a logo como fallback se o SVG não puder ser carregado.
  }

  for (let index = 0; index < slides.length; index += 1) {
    const report = slides[index]
    const node = findSlideNode(report.id)
    if (!node) throw new Error(`Prévia do slide ${index + 1} não encontrada.`)

    const logoBox = logoSvgData ? getPptxElementBox(node, '.report-logo') : null
    const imageData = await renderSlideAsPng(node, toPng, { hideLogo: Boolean(logoBox) })
    const slide = pptx.addSlide()
    slide.background = { color: 'FFFFFF' }
    slide.addImage({ data: imageData, x: 0, y: 0, w: 13.333, h: 7.5 })

    if (logoSvgData && logoBox) {
      slide.addImage({
        data: logoSvgData,
        ...logoBox,
        altText: 'Grupo GPS e GRSA',
        objectName: 'Logo oficial Grupo GPS e GRSA',
      })
    }

    onProgress?.(index + 1, slides.length)
  }

  await pptx.writeFile({ fileName: `${fileName}.pptx`, compression: true })
}
