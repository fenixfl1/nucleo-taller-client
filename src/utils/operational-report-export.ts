import dayjs from 'dayjs'
import { exportToExcel, exportToPDF } from './report-utils'
import { OperationalReport } from 'src/services/reports/report.types'

type FlatOperationalReportRow = {
  SECTION: string
  ITEM: string
  DETAIL: string
  VALUE: number | string
  SECONDARY_VALUE: number | string
  AMOUNT: number | string
}

const formatNumber = (value?: number | null) =>
  Number(value || 0).toLocaleString('es-DO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

const formatDate = (value?: string | null) =>
  value ? dayjs(value).format('DD/MM/YYYY') : 'Sin límite'

const buildExtraHeaderHtml = (report: OperationalReport): string => `
  <div>
    <h3>Resumen operativo del taller</h3>
    <p>Periodo: ${formatDate(report.FILTERS.START_DATE)} al ${formatDate(report.FILTERS.END_DATE)}</p>
    <p>OT abiertas: ${report.SUMMARY.OPENED_WORK_ORDERS}</p>
    <p>OT entregadas: ${report.SUMMARY.DELIVERED_WORK_ORDERS}</p>
    <p>OT canceladas: ${report.SUMMARY.CANCELLED_WORK_ORDERS}</p>
    <p>Comprobantes emitidos: ${report.SUMMARY.DELIVERY_RECEIPTS}</p>
    <p>Consumo de inventario: ${formatNumber(report.SUMMARY.INVENTORY_CONSUMPTION_QUANTITY)}</p>
    <p>Artículos bajo mínimo: ${report.SUMMARY.ARTICLES_BELOW_MINIMUM}</p>
    <p>Promedio de cierre (días): ${formatNumber(report.SUMMARY.AVERAGE_CLOSURE_DAYS)}</p>
  </div>
`

const buildRows = (report: OperationalReport): FlatOperationalReportRow[] => [
  ...report.WORK_ORDERS_BY_STATUS.map((item) => ({
    SECTION: 'OT por estado',
    ITEM: item.STATUS_NAME,
    DETAIL: item.STATUS_CODE,
    VALUE: item.TOTAL,
    SECONDARY_VALUE: '',
    AMOUNT: '',
  })),
  ...report.TOP_CONSUMED_ARTICLES.map((item) => ({
    SECTION: 'Artículos consumidos',
    ITEM: `${item.ARTICLE_CODE} - ${item.ARTICLE_NAME}`,
    DETAIL: `${item.MOVEMENT_COUNT} movimientos`,
    VALUE: item.TOTAL_QUANTITY,
    SECONDARY_VALUE: item.MOVEMENT_COUNT,
    AMOUNT: item.TOTAL_ESTIMATED_COST,
  })),
  ...report.LOW_STOCK_ARTICLES.map((item) => ({
    SECTION: 'Stock crítico',
    ITEM: `${item.CODE} - ${item.NAME}`,
    DETAIL: item.ITEM_TYPE,
    VALUE: item.CURRENT_STOCK,
    SECONDARY_VALUE: item.DEFICIT,
    AMOUNT: item.COST_REFERENCE ?? '',
  })),
  ...report.TOP_TECHNICIANS.map((item) => ({
    SECTION: 'Técnicos',
    ITEM: item.FULL_NAME,
    DETAIL: item.USERNAME,
    VALUE: item.TOTAL_ASSIGNED_ORDERS,
    SECONDARY_VALUE: item.DELIVERED_ORDERS,
    AMOUNT: item.LEAD_ORDERS,
  })),
]

const columnsMap = {
  SECTION: 'Sección',
  ITEM: 'Item',
  DETAIL: 'Detalle',
  VALUE: 'Valor principal',
  SECONDARY_VALUE: 'Valor secundario',
  AMOUNT: 'Monto / apoyo',
} as const

export const exportOperationalReportExcel = async (report: OperationalReport) => {
  await exportToExcel({
    data: buildRows(report),
    filename: `reporte_operativo_${dayjs().format('YYYYMMDD_HHmmss')}`,
    title: 'Reporte operativo',
    columnsMap,
    extraHeaderHtml: buildExtraHeaderHtml(report),
  })
}

export const exportOperationalReportPdf = async (report: OperationalReport) => {
  await exportToPDF({
    data: buildRows(report),
    filename: `reporte_operativo_${dayjs().format('YYYYMMDD_HHmmss')}`,
    title: 'Reporte operativo',
    orientation: 'landscape',
    columnsMap,
    extraHeaderHtml: buildExtraHeaderHtml(report),
  })
}
