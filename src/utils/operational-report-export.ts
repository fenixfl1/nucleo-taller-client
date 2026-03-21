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
    <p>Tipo de empleado: ${report.FILTERS.EMPLOYEE_TYPE === 'ADMINISTRATIVO' ? 'Administrativo' : report.FILTERS.EMPLOYEE_TYPE === 'OPERACIONAL' ? 'Operacional' : 'Todos'}</p>
    <p>Empleado: ${report.FILTERS.STAFF_LABEL || 'Todos'}</p>
    <p>OT abiertas: ${report.SUMMARY.OPENED_WORK_ORDERS}</p>
    <p>OT entregadas: ${report.SUMMARY.DELIVERED_WORK_ORDERS}</p>
    <p>OT canceladas: ${report.SUMMARY.CANCELLED_WORK_ORDERS}</p>
    <p>Comprobantes emitidos: ${report.SUMMARY.DELIVERY_RECEIPTS}</p>
    <p>Vehículos de servicio activos: ${report.SUMMARY.ACTIVE_SERVICE_VEHICLES}</p>
    <p>Flota disponible: ${report.SUMMARY.AVAILABLE_SERVICE_VEHICLES}</p>
    <p>Mantenimientos pendientes: ${report.SUMMARY.PENDING_SERVICE_VEHICLE_MAINTENANCE}</p>
    <p>Mantenimientos vencidos: ${report.SUMMARY.OVERDUE_SERVICE_VEHICLE_MAINTENANCE}</p>
    <p>Eventos de flota: ${report.SUMMARY.SERVICE_VEHICLE_HISTORY_EVENTS}</p>
    <p>Horas de uso acumuladas: ${formatNumber(report.SUMMARY.TOTAL_SERVICE_VEHICLE_USAGE_HOURS)}</p>
    <p>Kilometraje acumulado: ${formatNumber(report.SUMMARY.TOTAL_SERVICE_VEHICLE_USAGE_KILOMETERS)}</p>
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
    SECTION: 'Productividad por empleado',
    ITEM: item.FULL_NAME,
    DETAIL: `${item.USERNAME} · OT entregadas: ${item.DELIVERED_ORDERS}`,
    VALUE: item.TOTAL_ASSIGNED_ORDERS,
    SECONDARY_VALUE: item.TOTAL_SERVICE_LINES,
    AMOUNT: item.TOTAL_REFERENCE_AMOUNT,
  })),
  ...report.SERVICE_VEHICLES_BY_STATE.map((item) => ({
    SECTION: 'Vehículos de servicio',
    ITEM: item.STATE === 'A' ? 'Activos' : 'Inactivos',
    DETAIL: 'Flota interna',
    VALUE: item.TOTAL,
    SECONDARY_VALUE: '',
    AMOUNT: '',
  })),
  ...report.SERVICE_VEHICLE_FLEET.map((item) => ({
    SECTION: 'Flota por marca/modelo',
    ITEM: `${item.BRAND} - ${item.MODEL}`,
    DETAIL: 'Vehículo de servicio',
    VALUE: item.TOTAL,
    SECONDARY_VALUE: '',
    AMOUNT: '',
  })),
  ...report.SERVICE_VEHICLE_HISTORY.map((item) => ({
    SECTION: 'Historial flota',
    ITEM: `${item.VEHICLE_NAME}${item.PLATE ? ` (${item.PLATE})` : ''}`,
    DETAIL: `${item.ACTION} · ${item.ACTOR_NAME || item.USERNAME || 'N/D'}`,
    VALUE: item.EMPLOYEE_TYPE === 'ADMINISTRATIVO' ? 'Administrativo' : item.EMPLOYEE_TYPE === 'OPERACIONAL' ? 'Operacional' : item.EMPLOYEE_TYPE,
    SECONDARY_VALUE: item.CREATED_AT ? dayjs(item.CREATED_AT).format('DD/MM/YYYY HH:mm') : '',
    AMOUNT: '',
  })),
  ...report.SERVICE_VEHICLE_MAINTENANCE_BY_VEHICLE.map((item) => ({
    SECTION: 'Mtto. pendiente/vencido',
    ITEM: `${item.VEHICLE_NAME}${item.PLATE ? ` (${item.PLATE})` : ''}`,
    DETAIL: `Próximo: ${item.NEXT_SCHEDULED_AT ? dayjs(item.NEXT_SCHEDULED_AT).format('DD/MM/YYYY HH:mm') : 'N/D'}`,
    VALUE: item.PENDING_TOTAL,
    SECONDARY_VALUE: item.OVERDUE_TOTAL,
    AMOUNT: '',
  })),
  ...report.SERVICE_VEHICLE_USAGE_BY_VEHICLE.map((item) => ({
    SECTION: 'Uso acumulado',
    ITEM: `${item.VEHICLE_NAME}${item.PLATE ? ` (${item.PLATE})` : ''}`,
    DETAIL: item.LAST_USAGE_AT
      ? `Último uso: ${dayjs(item.LAST_USAGE_AT).format('DD/MM/YYYY HH:mm')}`
      : 'Sin último uso',
    VALUE: item.TOTAL_USAGES,
    SECONDARY_VALUE: item.TOTAL_HOURS,
    AMOUNT: item.TOTAL_KILOMETERS,
  })),
  ...report.SERVICE_VEHICLE_AVAILABILITY.map((item) => ({
    SECTION: 'Disponibilidad flota',
    ITEM: `${item.VEHICLE_NAME}${item.PLATE ? ` (${item.PLATE})` : ''}`,
    DETAIL: `${item.BRAND} ${item.MODEL}`.trim(),
    VALUE:
      item.AVAILABILITY_STATUS === 'DISPONIBLE'
        ? 'Disponible'
        : item.AVAILABILITY_STATUS === 'DISPONIBLE_CON_PENDIENTE'
          ? 'Disponible con pendiente'
          : item.AVAILABILITY_STATUS === 'EN_MANTENIMIENTO'
            ? 'En mantenimiento'
            : item.AVAILABILITY_STATUS === 'EN_USO'
              ? 'En uso'
              : 'Inactivo',
    SECONDARY_VALUE: item.OPEN_MAINTENANCE_COUNT,
    AMOUNT: item.CURRENT_USAGE_COUNT,
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
