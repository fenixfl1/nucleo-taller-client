import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import dayjs from 'dayjs'
import { getBusinessInfo, getSessionInfo } from 'src/lib/session'
import { WorkOrder } from 'src/services/work-orders/work-order.types'
import { addPdfBusinessLogo } from './pdf-logo'

type PdfDocument = jsPDF & {
  lastAutoTable?: {
    finalY: number
  }
}

const formatDate = (value?: string | null) =>
  value ? dayjs(value).format('DD/MM/YYYY HH:mm') : 'N/A'

const formatNumber = (value?: number | null) => Number(value || 0).toFixed(2)

const statusLabels: Record<string, string> = {
  CREADA: 'Creada',
  DIAGNOSTICO: 'En diagnóstico',
  REPARACION: 'En reparación',
  LISTA_ENTREGA: 'Lista para entrega',
  ENTREGADA: 'Entregada',
  CANCELADA: 'Cancelada',
}

export const buildWorkOrderPdf = async (workOrder: WorkOrder) => {
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
  doc.text('Detalle de Orden de Trabajo', pageWidth / 2, 18, {
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

  doc.text(`Orden: ${workOrder.ORDER_NO}`, pageWidth - 14, 28, {
    align: 'right',
  })
  doc.text(
    `Estado: ${statusLabels[workOrder.STATUS_CODE] || workOrder.STATUS_NAME || 'N/A'}`,
    pageWidth - 14,
    33,
    {
      align: 'right',
    }
  )
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
      ['Cliente', workOrder.CUSTOMER_NAME || 'N/A'],
      ['Vehículo', workOrder.VEHICLE_LABEL || 'N/A'],
      ['Apertura', formatDate(workOrder.OPENED_AT)],
      ['Promesa', formatDate(workOrder.PROMISED_AT)],
      ['Cierre', formatDate(workOrder.CLOSED_AT)],
      ['Recibida por', workOrder.RECEIVED_BY_NAME || 'N/A'],
      ['Entregada por', workOrder.DELIVERED_BY_NAME || 'N/A'],
      ['Requiere desmonte', workOrder.REQUIRES_DISASSEMBLY ? 'Sí' : 'No'],
      ['Síntoma', workOrder.SYMPTOM || 'N/A'],
      ['Diagnóstico', workOrder.DIAGNOSIS || 'N/A'],
      ['Trabajo realizado', workOrder.WORK_PERFORMED || 'N/A'],
      ['Obs. cliente', workOrder.CUSTOMER_OBSERVATIONS || 'N/A'],
      ['Notas internas', workOrder.INTERNAL_NOTES || 'N/A'],
    ],
    columnStyles: {
      0: { cellWidth: 42, fontStyle: 'bold' },
      1: { cellWidth: pageWidth - 62 },
    },
  })

  let nextY = (doc.lastAutoTable?.finalY || y) + 8

  const serviceLines = workOrder.SERVICE_LINES || []
  const consumedItems = workOrder.CONSUMED_ITEMS || []
  const technicians = workOrder.TECHNICIANS || []
  const statusHistory = workOrder.STATUS_HISTORY || []

  if (serviceLines.length) {
    const totalServices = serviceLines.reduce((accumulator, item) => {
      return (
        accumulator +
        Number(item.QUANTITY || 0) * Number(item.REFERENCE_AMOUNT || 0)
      )
    }, 0)

    doc.setFontSize(12)
    doc.text(
      `Servicios - Total referencial: RD$ ${formatNumber(totalServices)}`,
      14,
      nextY
    )
    nextY += 4

    autoTable(doc, {
      startY: nextY,
      theme: 'striped',
      styles: { fontSize: 8, cellPadding: 2 },
      head: [['Servicio', 'Descripción', 'Cant.', 'Precio ref.', 'Total', 'Notas']],
      body: serviceLines.map((item) => [
        item.SERVICE_TYPE || '',
        item.DESCRIPTION || '',
        formatNumber(item.QUANTITY),
        formatNumber(item.REFERENCE_AMOUNT),
        formatNumber(Number(item.QUANTITY || 0) * Number(item.REFERENCE_AMOUNT || 0)),
        item.NOTES || '',
      ]),
    })

    nextY = (doc.lastAutoTable?.finalY || nextY) + 8
  }

  if (consumedItems.length) {
    doc.setFontSize(12)
    doc.text('Consumo de artículos', 14, nextY)
    nextY += 4

    autoTable(doc, {
      startY: nextY,
      theme: 'striped',
      styles: { fontSize: 8, cellPadding: 2 },
      head: [['Artículo', 'Cantidad', 'Costo ref.', 'Notas']],
      body: consumedItems.map((item) => [
        `${item.ARTICLE_CODE || ''} ${item.ARTICLE_NAME || ''}`.trim(),
        formatNumber(item.QUANTITY),
        item.UNIT_COST_REFERENCE == null
          ? 'N/A'
          : formatNumber(item.UNIT_COST_REFERENCE),
        item.NOTES || '',
      ]),
    })

    nextY = (doc.lastAutoTable?.finalY || nextY) + 8
  }

  if (technicians.length) {
    doc.setFontSize(12)
    doc.text('Técnicos asignados', 14, nextY)
    nextY += 4

    autoTable(doc, {
      startY: nextY,
      theme: 'striped',
      styles: { fontSize: 8, cellPadding: 2 },
      head: [['Empleado', 'Rol', 'Líder', '% ref.', 'Monto ref.', 'Notas']],
      body: technicians.map((item) => [
        item.STAFF_NAME || 'N/A',
        item.ROLE_ON_JOB || 'N/A',
        item.IS_LEAD ? 'Sí' : 'No',
        item.REFERENCE_PERCENT == null ? 'N/A' : formatNumber(item.REFERENCE_PERCENT),
        item.REFERENCE_AMOUNT == null ? 'N/A' : formatNumber(item.REFERENCE_AMOUNT),
        item.NOTES || '',
      ]),
    })

    nextY = (doc.lastAutoTable?.finalY || nextY) + 8
  }

  if (statusHistory.length) {
    doc.setFontSize(12)
    doc.text('Historial de estados', 14, nextY)
    nextY += 4

    autoTable(doc, {
      startY: nextY,
      theme: 'striped',
      styles: { fontSize: 8, cellPadding: 2 },
      head: [['Estado', 'Fecha', 'Responsable', 'Notas']],
      body: statusHistory.map((item) => [
        item.STATUS_NAME || item.STATUS_CODE || 'N/A',
        formatDate(item.CHANGED_AT),
        item.CHANGED_BY_NAME || 'N/A',
        item.NOTES || '',
      ]),
    })
  }

  return doc
}

export const createWorkOrderPdfObjectUrl = (workOrder: WorkOrder) => {
  return buildWorkOrderPdf(workOrder).then((doc) => {
    const blob = doc.output('blob')
    return URL.createObjectURL(blob)
  })
}

export const revokeWorkOrderPdfObjectUrl = (url?: string | null) => {
  if (!url) return
  URL.revokeObjectURL(url)
}

export const downloadWorkOrderPdf = (workOrder: WorkOrder) => {
  return buildWorkOrderPdf(workOrder).then((doc) => {
    doc.save(`orden_trabajo_${workOrder.ORDER_NO || workOrder.WORK_ORDER_ID}.pdf`)
  })
}

export const printWorkOrderPdf = (workOrder: WorkOrder) => {
  return buildWorkOrderPdf(workOrder).then((doc) => {
    doc.autoPrint()
    const blobUrl = doc.output('bloburl')
    window.open(blobUrl, '_blank', 'noopener,noreferrer')
  })
}
