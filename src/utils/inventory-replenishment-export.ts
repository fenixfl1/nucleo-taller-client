import dayjs from 'dayjs'
import {
  InventoryReplenishment,
  InventoryReplenishmentSummary,
} from 'src/services/inventory-replenishment/inventory-replenishment.types'
import { exportToExcel, exportToPDF } from './report-utils'

const formatNumber = (value?: number | null) =>
  Number(value || 0).toLocaleString('es-DO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

const buildExtraHeaderHtml = (
  summary: InventoryReplenishmentSummary
): string => `
  <div>
    <h3>Resumen de Reposición</h3>
    <p>Ventana analizada: ${summary.MONTH_WINDOW} meses</p>
    <p>Artículos bajo mínimo: ${summary.BELOW_MINIMUM_COUNT}</p>
    <p>Cantidad total sugerida: ${formatNumber(summary.TOTAL_SUGGESTED_QUANTITY)}</p>
    <p>Valor estimado: RD$ ${formatNumber(summary.ESTIMATED_VALUE)}</p>
  </div>
`

const columnsMap = {
  CODE: 'Referencia',
  NAME: 'Artículo',
  ITEM_TYPE: 'Tipo',
  UNIT_MEASURE: 'Unidad',
  CATEGORY: 'Categoría',
  CURRENT_STOCK: 'Stock actual',
  MIN_STOCK: 'Stock mínimo',
  MAX_STOCK: 'Stock máximo',
  AVG_MONTHLY_CONSUMPTION: 'Consumo mensual prom.',
  TARGET_STOCK: 'Stock objetivo',
  SUGGESTED_REPLENISHMENT: 'Cantidad sugerida',
  COST_REFERENCE: 'Costo ref.',
  COMPATIBILITY_COUNT: 'Compatibilidades',
  LAST_CONSUMPTION_DATE: 'Últ. consumo',
  LAST_MOVEMENT_DATE: 'Últ. movimiento',
} as const

export const exportInventoryReplenishmentSummaryExcel = async (
  rows: InventoryReplenishment[],
  summary: InventoryReplenishmentSummary
) => {
  await exportToExcel({
    data: rows,
    filename: `resumen_reposicion_${dayjs().format('YYYYMMDD_HHmmss')}`,
    title: 'Resumen de reposicion',
    columnsMap,
    extraHeaderHtml: buildExtraHeaderHtml(summary),
  })
}

export const exportInventoryReplenishmentSummaryPdf = async (
  rows: InventoryReplenishment[],
  summary: InventoryReplenishmentSummary
) => {
  await exportToPDF({
    data: rows,
    filename: `resumen_reposicion_${dayjs().format('YYYYMMDD_HHmmss')}`,
    title: 'Resumen de reposicion',
    orientation: 'landscape',
    columnsMap,
    extraHeaderHtml: buildExtraHeaderHtml(summary),
  })
}
