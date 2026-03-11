import jsPDF from 'jspdf'

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined'

const isProbablyBase64Image = (value: string): boolean =>
  /^[A-Za-z0-9+/=\r\n]+$/.test(value) && !value.includes(' ')

export const detectPdfImageFormat = (
  value?: string | null
): 'PNG' | 'JPEG' | 'WEBP' => {
  const normalized = String(value || '').toLowerCase()

  if (
    normalized.startsWith('data:image/jpeg') ||
    normalized.startsWith('data:image/jpg')
  ) {
    return 'JPEG'
  }

  if (normalized.startsWith('data:image/webp')) {
    return 'WEBP'
  }

  return 'PNG'
}

export const resolvePdfLogoDataUrl = async (
  value?: string
): Promise<string | null> => {
  if (!value) return null

  if (value.startsWith('data:image/')) {
    return value
  }

  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('/')
  ) {
    if (!isBrowser) return null

    try {
      const response = await fetch(value)
      const blob = await response.blob()

      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(String(reader.result))
        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(blob)
      })
    } catch {
      return null
    }
  }

  if (isProbablyBase64Image(value)) {
    return `data:image/png;base64,${value.replace(/\s/g, '')}`
  }

  return null
}

export const addPdfBusinessLogo = async (
  doc: jsPDF,
  logo?: string,
  options: {
    x?: number
    y?: number
    width?: number
    height?: number
  } = {}
): Promise<boolean> => {
  const dataUrl = await resolvePdfLogoDataUrl(logo)
  if (!dataUrl) return false

  const { x = 10, y = 10, width = 24, height = 24 } = options

  try {
    doc.addImage(
      dataUrl,
      detectPdfImageFormat(dataUrl),
      x,
      y,
      width,
      height
    )
    return true
  } catch {
    return false
  }
}
