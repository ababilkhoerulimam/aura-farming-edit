import type { FaceBounds } from '../face-detection/faceDetector'
import { getTemplate } from '../templates/templates'

const OUTPUT_SIZE = 1080

function drawCoverImage(context: CanvasRenderingContext2D, source: CanvasImageSource, x: number, y: number, width: number, height: number, focalPoint?: { x: number; y: number }) {
  const sourceWidth = source instanceof HTMLVideoElement ? source.videoWidth : source instanceof HTMLImageElement ? source.naturalWidth : 0
  const sourceHeight = source instanceof HTMLVideoElement ? source.videoHeight : source instanceof HTMLImageElement ? source.naturalHeight : 0
  if (!sourceWidth || !sourceHeight) return

  const sourceRatio = sourceWidth / sourceHeight
  const targetRatio = width / height
  let cropWidth = sourceWidth
  let cropHeight = sourceHeight
  let cropX = 0
  let cropY = 0

  if (sourceRatio > targetRatio) {
    cropWidth = sourceHeight * targetRatio
    cropX = focalPoint ? Math.min(Math.max(focalPoint.x * sourceWidth - cropWidth / 2, 0), sourceWidth - cropWidth) : (sourceWidth - cropWidth) / 2
  } else {
    cropHeight = sourceWidth / targetRatio
    cropY = focalPoint ? Math.min(Math.max(focalPoint.y * sourceHeight - cropHeight / 2, 0), sourceHeight - cropHeight) : (sourceHeight - cropHeight) / 2
  }

  context.drawImage(source, cropX, cropY, cropWidth, cropHeight, x, y, width, height)
}

function drawText(context: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = 'left') {
  context.save()
  context.font = `900 ${size}px Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif`
  context.textAlign = align
  context.textBaseline = 'middle'
  context.fillStyle = color
  context.fillText(text, x, y)
  context.restore()
}

export function renderSigmaSplit(source: HTMLVideoElement, face?: FaceBounds | null, templateId = 'sigma_split_01'): Promise<Blob | null> {
  const template = getTemplate(templateId)
  const canvas = document.createElement('canvas')
  canvas.width = OUTPUT_SIZE
  canvas.height = OUTPUT_SIZE
  const context = canvas.getContext('2d')
  if (!context) return Promise.resolve(null)

  context.fillStyle = '#0B0B0F'
  context.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE)

  const leftWidth = 590
  const focalPoint = face
    ? { x: (face.x + face.width / 2) / source.videoWidth, y: (face.y + face.height / 2) / source.videoHeight }
    : undefined
  drawCoverImage(context, source, 0, 0, leftWidth, OUTPUT_SIZE, focalPoint)

  context.save()
  context.filter = 'grayscale(0.55) contrast(1.25) saturate(0.85)'
  drawCoverImage(context, source, 0, 0, leftWidth, OUTPUT_SIZE, focalPoint)
  context.restore()

  const photoGradient = context.createLinearGradient(0, 0, leftWidth, 0)
  photoGradient.addColorStop(0, 'rgba(11, 11, 15, 0)')
  photoGradient.addColorStop(0.7, 'rgba(11, 11, 15, 0.08)')
  photoGradient.addColorStop(1, 'rgba(11, 11, 15, 0.96)')
  context.fillStyle = photoGradient
  context.fillRect(0, 0, leftWidth, OUTPUT_SIZE)

  context.fillStyle = template.id === 'reaction_card_01' ? '#171122' : '#15151D'
  context.fillRect(leftWidth, 0, OUTPUT_SIZE - leftWidth, OUTPUT_SIZE)

  const panelGradient = context.createLinearGradient(leftWidth, 0, OUTPUT_SIZE, OUTPUT_SIZE)
  panelGradient.addColorStop(0, `${template.secondaryAccent}18`)
  panelGradient.addColorStop(0.5, 'rgba(21, 21, 29, 0)')
  panelGradient.addColorStop(1, `${template.accent}24`)
  context.fillStyle = panelGradient
  context.fillRect(leftWidth, 0, OUTPUT_SIZE - leftWidth, OUTPUT_SIZE)

  // Abstract placeholder portrait. It is intentionally procedural so the MVP does not depend on copyrighted assets.
  const centerX = 835
  const centerY = 430
  context.save()
  context.shadowColor = 'rgba(0, 217, 255, 0.45)'
  context.shadowBlur = 35
  context.fillStyle = '#242431'
  context.beginPath()
  context.arc(centerX, centerY - 115, 105, 0, Math.PI * 2)
  context.fill()
  context.beginPath()
  context.ellipse(centerX, centerY + 115, 190, 230, 0, 0, Math.PI * 2)
  context.fill()
  context.restore()

  context.strokeStyle = `${template.secondaryAccent}8C`
  context.lineWidth = 3
  context.beginPath()
  context.arc(centerX, centerY, 250, 0.15, Math.PI * 1.82)
  context.stroke()
  context.strokeStyle = `${template.accent}B3`
  context.beginPath()
  context.arc(centerX, centerY, 220, Math.PI * 1.05, Math.PI * 1.74)
  context.stroke()

  drawText(context, template.panelTitle, centerX, 705, template.id === 'aura_poster_01' ? 43 : 66, '#F5F5F5', 'center')
  drawText(context, template.caption, centerX, 785, 78, template.accent, 'center')
  drawText(context, 'PHOTO MODE', centerX, 850, 18, template.secondaryAccent, 'center')

  context.fillStyle = 'rgba(0, 0, 0, 0.28)'
  context.fillRect(0, 900, OUTPUT_SIZE, 180)
  drawText(context, template.name.toUpperCase(), 54, 965, 42, '#F5F5F5')
  drawText(context, 'CAPTURED IN REAL TIME', 56, 1020, 18, '#A1A1AA')

  context.strokeStyle = 'rgba(245, 245, 245, 0.18)'
  context.lineWidth = 3
  context.strokeRect(20, 20, OUTPUT_SIZE - 40, OUTPUT_SIZE - 40)

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
}
