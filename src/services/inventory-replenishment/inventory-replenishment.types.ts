import { GetPayload } from 'src/types/general'

export interface InventoryReplenishment {
  ARTICLE_ID: number
  CODE: string
  NAME: string
  ITEM_TYPE: string
  UNIT_MEASURE: string
  CATEGORY: string
  CURRENT_STOCK: number
  MIN_STOCK: number
  MAX_STOCK: number | null
  COST_REFERENCE: number | null
  TOTAL_CONSUMED: number
  AVG_MONTHLY_CONSUMPTION: number
  TARGET_STOCK: number
  SUGGESTED_REPLENISHMENT: number
  LAST_MOVEMENT_DATE: string | null
  LAST_CONSUMPTION_DATE: string | null
  COMPATIBILITY_COUNT: number
  IS_BELOW_MINIMUM: boolean
  IS_ACTIONABLE: boolean
  MONTH_WINDOW: number
  STATE: string
}

export interface InventoryReplenishmentSummary {
  BELOW_MINIMUM_COUNT: number
  ACTIONABLE_COUNT: number
  TOTAL_SUGGESTED_QUANTITY: number
  ESTIMATED_VALUE: number
  MONTH_WINDOW: number
}

export interface GetInventoryReplenishmentPayload
  extends GetPayload<InventoryReplenishment> {
  months?: number
}
