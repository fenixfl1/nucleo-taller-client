export type InventoryMovementCode =
  | 'ENTRY'
  | 'EXIT'
  | 'ADJUSTMENT_IN'
  | 'ADJUSTMENT_OUT'
  | 'WORK_ORDER_CONSUMPTION'
  | 'WORK_ORDER_REVERSAL'
  | 'INTERNAL_PURCHASE_RECEIPT'

export interface InventoryMovementType {
  CODE: InventoryMovementCode
  NAME: string
  IS_SYSTEM: boolean
}

export interface InventoryMovementDetail {
  MOVEMENT_DETAIL_ID?: number
  ARTICLE_ID: number
  ARTICLE_CODE?: string
  ARTICLE_NAME?: string
  QUANTITY: number
  UNIT_COST_REFERENCE?: number | null
  NOTES?: string
}

export interface InventoryMovement {
  MOVEMENT_ID: number
  MOVEMENT_NO: string
  MOVEMENT_TYPE: InventoryMovementCode
  MOVEMENT_DATE: string
  REFERENCE_SOURCE: string
  REFERENCE_ID: number | null
  NOTES: string
  STATE: string
  DETAILS?: InventoryMovementDetail[]
  CREATED_AT?: string | null
}

export interface InventoryMovementPayload {
  MOVEMENT_TYPE: Exclude<
    InventoryMovementCode,
    'WORK_ORDER_CONSUMPTION' | 'WORK_ORDER_REVERSAL' | 'INTERNAL_PURCHASE_RECEIPT'
  >
  MOVEMENT_DATE?: string | null
  NOTES?: string | null
  DETAILS: InventoryMovementDetail[]
  STATE?: 'A' | 'I'
}
