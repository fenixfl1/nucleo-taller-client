export interface InternalPurchaseOrderLine {
  INTERNAL_PURCHASE_ORDER_LINE_ID: number
  ARTICLE_ID: number
  ARTICLE_CODE: string
  ARTICLE_NAME: string
  QUANTITY: number
  UNIT_COST_REFERENCE: number | null
  NOTES: string
}

export interface InternalPurchaseOrder {
  INTERNAL_PURCHASE_ORDER_ID: number
  ORDER_NO: string
  ORDER_DATE: string
  STATUS: string
  SOURCE: string
  NOTES: string
  STATE: string
  ESTIMATED_TOTAL: number
  LINE_COUNT?: number
  ITEM_SUMMARY?: string
  SENT_AT?: string | null
  RECEIVED_AT?: string | null
  CANCELLED_AT?: string | null
  RECEIVED_MOVEMENT_ID?: number | null
  RECEIVED_MOVEMENT_NO?: string | null
  LINES: InternalPurchaseOrderLine[]
  CREATED_AT?: string
}

export interface UpdateInternalPurchaseOrderStatusPayload {
  INTERNAL_PURCHASE_ORDER_ID: number
  STATUS: 'GENERADA' | 'ENVIADA' | 'RECIBIDA' | 'CANCELADA'
  ACTION_DATE?: string | null
}

export interface InternalPurchaseOrderPayload {
  ORDER_DATE?: string | null
  NOTES?: string | null
  ITEMS: Array<{
    ARTICLE_ID: number
    QUANTITY: number
    UNIT_COST_REFERENCE?: number | null
    NOTES?: string | null
  }>
  STATE?: string
}
