export interface DeliveryReceipt {
  DELIVERY_RECEIPT_ID: number
  RECEIPT_NO: string
  WORK_ORDER_ID: number
  WORK_ORDER_NO: string
  CUSTOMER_NAME: string
  VEHICLE_LABEL: string
  DELIVERED_BY_STAFF_ID: number
  DELIVERED_BY_NAME: string
  DELIVERY_DATE: string
  RECEIVED_BY_NAME: string
  RECEIVED_BY_DOCUMENT: string
  RECEIVED_BY_PHONE: string
  OBSERVATIONS: string
  STATE: string
  CREATED_AT?: string | null
}

export interface DeliveryReceiptPayload {
  WORK_ORDER_ID: number
  DELIVERY_DATE?: string | null
  RECEIVED_BY_NAME: string
  RECEIVED_BY_DOCUMENT?: string | null
  RECEIVED_BY_PHONE?: string | null
  OBSERVATIONS?: string | null
  STATE?: 'A' | 'I'
}
