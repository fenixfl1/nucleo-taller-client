import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import dayjs from 'dayjs'
import { getBusinessInfo, getSessionInfo } from 'src/lib/session'
import { DeliveryReceipt } from 'src/services/delivery-receipts/delivery-receipt.types'
import { WorkOrder } from 'src/services/work-orders/work-order.types'
import { addPdfBusinessLogo } from './pdf-logo'

export type DeliveryReceiptPdfParams = {
  receipt: DeliveryReceipt
  workOrder?: WorkOrder
}

type PdfDocument = jsPDF & {
  lastAutoTable?: {
    finalY: number
  }
}

const formatDate = (value?: string | null) =>
  value ? dayjs(value).format('DD/MM/YYYY HH:mm') : 'N/A'

export const buildDeliveryReceiptPdf = async ({
  receipt,
  workOrder,
}: DeliveryReceiptPdfParams) => {
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
  doc.text('Comprobante Interno de Entrega', pageWidth / 2, hasLogo ? 18 : 18, {
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

  doc.text(`Comprobante: ${receipt.RECEIPT_NO}`, pageWidth - 14, 28, {
    align: 'right',
  })
  doc.text(`Fecha: ${formatDate(receipt.DELIVERY_DATE)}`, pageWidth - 14, 33, {
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
      ['Orden de trabajo', receipt.WORK_ORDER_NO],
      ['Cliente', receipt.CUSTOMER_NAME],
      ['Vehículo', receipt.VEHICLE_LABEL],
      ['Entregado por', receipt.DELIVERED_BY_NAME],
      ['Recibido por', receipt.RECEIVED_BY_NAME],
      ['Documento', receipt.RECEIVED_BY_DOCUMENT || 'N/A'],
      ['Teléfono', receipt.RECEIVED_BY_PHONE || 'N/A'],
    ],
  })

  let nextY = (doc.lastAutoTable?.finalY || y) + 8

  if (workOrder) {
    autoTable(doc, {
      startY: nextY,
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: 1 },
      body: [
        ['Síntoma reportado', workOrder.SYMPTOM || 'N/A'],
        ['Diagnóstico', workOrder.DIAGNOSIS || 'N/A'],
        ['Trabajo realizado', workOrder.WORK_PERFORMED || 'N/A'],
        ['Observaciones de entrega', receipt.OBSERVATIONS || 'N/A'],
      ],
      columnStyles: {
        0: { cellWidth: 45, fontStyle: 'bold' },
        1: { cellWidth: 135 },
      },
    })

    nextY = (doc.lastAutoTable?.finalY || nextY) + 6

    if (workOrder.CONSUMED_ITEMS?.length) {
      autoTable(doc, {
        startY: nextY,
        theme: 'striped',
        styles: { fontSize: 8, cellPadding: 2 },
        head: [['Artículo', 'Cantidad', 'Costo Ref.', 'Notas']],
        body: workOrder.CONSUMED_ITEMS.map((item) => [
          `${item.ARTICLE_CODE || ''} ${item.ARTICLE_NAME || ''}`.trim(),
          Number(item.QUANTITY || 0).toFixed(2),
          item.UNIT_COST_REFERENCE === null || item.UNIT_COST_REFERENCE === undefined
            ? 'N/A'
            : Number(item.UNIT_COST_REFERENCE).toFixed(2),
          item.NOTES || '',
        ]),
      })

      nextY = (doc.lastAutoTable?.finalY || nextY) + 6
    }

    if (workOrder.SERVICE_LINES?.length) {
      autoTable(doc, {
        startY: nextY,
        theme: 'striped',
        styles: { fontSize: 8, cellPadding: 2 },
        head: [['Servicio', 'Descripción', 'Cant.', 'Monto Ref.']],
        body: workOrder.SERVICE_LINES.map((item) => [
          item.SERVICE_TYPE || '',
          item.DESCRIPTION || '',
          Number(item.QUANTITY || 0).toFixed(2),
          Number(item.REFERENCE_AMOUNT || 0).toFixed(2),
        ]),
      })

      nextY = (doc.lastAutoTable?.finalY || nextY) + 10
    }
  }

  doc.setFontSize(9)
  doc.text(
    'Este documento es un comprobante interno de entrega para control operativo.',
    14,
    nextY
  )

  return doc
}

export const createDeliveryReceiptPdfObjectUrl = (
  params: DeliveryReceiptPdfParams
) => {
  return buildDeliveryReceiptPdf(params).then((doc) => {
    const blob = doc.output('blob')
    return URL.createObjectURL(blob)
  })
}

export const revokeDeliveryReceiptPdfObjectUrl = (url?: string | null) => {
  if (!url) return
  URL.revokeObjectURL(url)
}

export const downloadDeliveryReceiptPdf = (params: DeliveryReceiptPdfParams) => {
  return buildDeliveryReceiptPdf(params).then((doc) => {
    doc.save(
      `comprobante_${params.receipt.RECEIPT_NO || params.receipt.DELIVERY_RECEIPT_ID}.pdf`
    )
  })
}

export const printDeliveryReceiptPdf = (params: DeliveryReceiptPdfParams) => {
  return buildDeliveryReceiptPdf(params).then((doc) => {
    doc.autoPrint()
    const blobUrl = doc.output('bloburl')
    window.open(blobUrl, '_blank', 'noopener,noreferrer')
  })
}
