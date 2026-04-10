import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import dayjs from 'dayjs'
import { getBusinessInfo, getSessionInfo } from 'src/lib/session'
import { InventoryMovement } from 'src/services/inventory-movements/inventory-movement.types'
import { addPdfBusinessLogo } from './pdf-logo'

type PdfDocument = jsPDF & {
  lastAutoTable?: {
    finalY: number
  }
}

const movementTypeLabels: Record<string, string> = {
  ENTRY: 'Entrada manual',
  EXIT: 'Salida manual',
  ADJUSTMENT_IN: 'Ajuste positivo',
  ADJUSTMENT_OUT: 'Ajuste negativo',
  WORK_ORDER_CONSUMPTION: 'Consumo por orden',
  WORK_ORDER_REVERSAL: 'Reversión por orden',
  INTERNAL_PURCHASE_RECEIPT: 'Recepción de orden interna',
}

const formatDate = (value?: string | null) =>
  value ? dayjs(value).format('DD/MM/YYYY HH:mm') : 'N/A'

const formatNumber = (value?: number | null) => Number(value || 0).toFixed(2)

const formatMovementNo = (value?: string | null) =>
  `${value || ''}`.replace(/^MOV-/i, '')

export const buildInventoryMovementPdf = async (
  movement: InventoryMovement
) => {
  const doc = new jsPDF({ orientation: 'portrait' }) as PdfDocument
  const business = getBusinessInfo()
  const session = getSessionInfo()
  const pageWidth = doc.internal.pageSize.getWidth()
  const hasLogo = await addPdfBusinessLogo(
    doc,
    business?.LOGO || business?.LOGO_URL,
    { x: 10, y: 10, width: 24, height: 24 }
  )

  doc.setFontSize(18)
  doc.text('Detalle de Movimiento de Inventario', pageWidth / 2, 18, {
    align: 'center',
  })

  doc.setFontSize(10)
  let y = hasLogo ? 38 : 28

  const addLine = (text?: string) => {
    if (!text) return
    doc.text(text, 14, y)
    y += 5
  }

  addLine(business?.NAME)
  addLine(business?.ADDRESS ? `Dirección: ${business.ADDRESS}` : undefined)
  addLine(business?.PHONE ? `Teléfono: ${business.PHONE}` : undefined)

  doc.text(`Movimiento: ${formatMovementNo(movement.MOVEMENT_NO)}`, pageWidth - 14, 28, {
    align: 'right',
  })
  doc.text(`Fecha: ${formatDate(movement.MOVEMENT_DATE)}`, pageWidth - 14, 33, {
    align: 'right',
  })
  doc.text(`Usuario: ${session?.username || 'N/A'}`, pageWidth - 14, 38, {
    align: 'right',
  })

  y = Math.max(y + 2, hasLogo ? 48 : 46)

  autoTable(doc, {
    startY: y,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2 },
    head: [['Dato', 'Valor']],
    body: [
      ['Tipo', movementTypeLabels[movement.MOVEMENT_TYPE] || movement.MOVEMENT_TYPE],
      ['Origen', movement.REFERENCE_SOURCE || 'N/A'],
      ['Referencia', movement.REFERENCE_ID ?? 'N/A'],
      ['Estado', movement.STATE === 'A' ? 'Activo' : 'Inactivo'],
      ['Notas', movement.NOTES || 'N/A'],
    ],
  })

  const nextY = (doc.lastAutoTable?.finalY || y) + 8

  autoTable(doc, {
    startY: nextY,
    theme: 'striped',
    styles: { fontSize: 8, cellPadding: 2 },
    head: [['Artículo', 'Cantidad', 'Costo ref.', 'Notas']],
    body: (movement.DETAILS || []).map((item) => [
      `${item.ARTICLE_CODE || ''} ${item.ARTICLE_NAME || ''}`.trim(),
      formatNumber(item.QUANTITY),
      item.UNIT_COST_REFERENCE === null || item.UNIT_COST_REFERENCE === undefined
        ? 'N/A'
        : formatNumber(item.UNIT_COST_REFERENCE),
      item.NOTES || '',
    ]),
  })

  return doc
}

export const createInventoryMovementPdfObjectUrl = (movement: InventoryMovement) => {
  return buildInventoryMovementPdf(movement).then((doc) => {
    const blob = doc.output('blob')
    return URL.createObjectURL(blob)
  })
}

export const revokeInventoryMovementPdfObjectUrl = (url?: string | null) => {
  if (!url) return
  URL.revokeObjectURL(url)
}

export const downloadInventoryMovementPdf = (movement: InventoryMovement) => {
  return buildInventoryMovementPdf(movement).then((doc) => {
    doc.save(
      `movimiento_${formatMovementNo(movement.MOVEMENT_NO) || movement.MOVEMENT_ID}.pdf`
    )
  })
}

export const printInventoryMovementPdf = (movement: InventoryMovement) => {
  return buildInventoryMovementPdf(movement).then((doc) => {
    doc.autoPrint()
    const blobUrl = doc.output('bloburl')
    window.open(blobUrl, '_blank', 'noopener,noreferrer')
  })
}
