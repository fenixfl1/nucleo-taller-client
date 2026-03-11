import React from 'react'

interface SVGReaderProps extends React.SVGProps<SVGSVGElement> {
  svg: string
  size?: number
}

/**
 * @description This component is used to read svg and render it.
 * @param {SVGReaderProps} props
 */
const normalizeSvgMarkup = (svg: string, size: number) => {
  const normalized = `${svg || ''}`.trim()
  if (!normalized) return ''

  const rootMatch = normalized.match(/<svg\b([^>]*)>/i)
  if (!rootMatch) return normalized

  const cleanedAttributes = rootMatch[1]
    .replace(/\s(width|height)="[^"]*"/gi, '')
    .replace(/\sstyle="[^"]*"/gi, '')
    .trim()

  const nextRoot = `<svg ${cleanedAttributes} width="${size}" height="${size}" style="display:block; width:${size}px; height:${size}px;">`
  return normalized.replace(rootMatch[0], nextRoot)
}

const SVGReader: React.FC<SVGReaderProps> = ({ svg: _svg, size = 20 }) => {
  const ref = React.useRef<HTMLDivElement>(null)
  const svgMarkup = React.useMemo(
    () => normalizeSvgMarkup(_svg, size),
    [_svg, size]
  )

  React.useEffect(() => {
    const svgElement = ref.current?.querySelector('svg')
    if (!svgElement) return

    svgElement.setAttribute('width', `${size}`)
    svgElement.setAttribute('height', `${size}`)
    svgElement.style.width = `${size}px`
    svgElement.style.height = `${size}px`
    svgElement.style.display = 'block'
  }, [size, svgMarkup])

  return (
    <div
      ref={ref}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: `${size}px`,
        height: `${size}px`,
        flexShrink: 0,
        lineHeight: 0,
      }}
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
    />
  )
}

export default SVGReader
