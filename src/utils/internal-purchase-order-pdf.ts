import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import dayjs from 'dayjs'
import { getBusinessInfo, getSessionInfo } from 'src/lib/session'
import { InternalPurchaseOrder } from 'src/services/internal-purchase-orders/internal-purchase-order.types'
import { addPdfBusinessLogo } from './pdf-logo'

type PdfDocument = jsPDF & {
  lastAutoTable?: {
    finalY: number
  }
}

const formatDate = (value?: string | null) =>
  value ? dayjs(value).format('DD/MM/YYYY HH:mm') : 'N/A'

const formatNumber = (value?: number | null) => Number(value || 0).toFixed(2)

export const buildInternalPurchaseOrderPdf = (
  order: InternalPurchaseOrder
) => {
  return buildInternalPurchaseOrderPdfDocument(order)
}

const buildInternalPurchaseOrderPdfDocument = async (
  order: InternalPurchaseOrder
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
  doc.text('Orden de Compra Interna', pageWidth / 2, 18, {
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

  doc.text(`Orden: ${order.ORDER_NO}`, pageWidth - 14, 28, {
    align: 'right',
  })
  doc.text(`Fecha: ${formatDate(order.ORDER_DATE)}`, pageWidth - 14, 33, {
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
      ['Estado', order.STATUS || 'N/A'],
      ['Origen', order.SOURCE || 'N/A'],
      ['Notas', order.NOTES || 'N/A'],
      ['Monto estimado', `RD$ ${formatNumber(order.ESTIMATED_TOTAL)}`],
    ],
  })

  const nextY = (doc.lastAutoTable?.finalY || y) + 8

  autoTable(doc, {
    startY: nextY,
    theme: 'striped',
    styles: { fontSize: 8, cellPadding: 2 },
    head: [['Artículo', 'Cantidad', 'Costo ref.', 'Subtotal', 'Notas']],
    body: (order.LINES || []).map((item) => [
      `${item.ARTICLE_CODE || ''} ${item.ARTICLE_NAME || ''}`.trim(),
      formatNumber(item.QUANTITY),
      item.UNIT_COST_REFERENCE === null
        ? 'N/A'
        : `RD$ ${formatNumber(item.UNIT_COST_REFERENCE)}`,
      `RD$ ${formatNumber(
        Number(item.QUANTITY || 0) * Number(item.UNIT_COST_REFERENCE || 0)
      )}`,
      item.NOTES || '',
    ]),
  })

  return doc
}

export const createInternalPurchaseOrderPdfObjectUrl = (
  order: InternalPurchaseOrder
) => {
  return buildInternalPurchaseOrderPdfDocument(order).then((doc) => {
    const blob = doc.output('blob')
    return URL.createObjectURL(blob)
  })
}

export const revokeInternalPurchaseOrderPdfObjectUrl = (url?: string | null) => {
  if (!url) return
  URL.revokeObjectURL(url)
}

export const downloadInternalPurchaseOrderPdf = (order: InternalPurchaseOrder) => {
  return buildInternalPurchaseOrderPdfDocument(order).then((doc) => {
    doc.save(
      `orden_interna_${order.ORDER_NO || order.INTERNAL_PURCHASE_ORDER_ID}.pdf`
    )
  })
}

export const printInternalPurchaseOrderPdf = (order: InternalPurchaseOrder) => {
  return buildInternalPurchaseOrderPdfDocument(order).then((doc) => {
    doc.autoPrint()
    const blobUrl = doc.output('bloburl')
    window.open(blobUrl, '_blank', 'noopener,noreferrer')
  })
}
