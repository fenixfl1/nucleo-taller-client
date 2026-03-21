export interface WorkOrderStatus {
  STATUS_ID: number
  CODE: string
  NAME: string
  DESCRIPTION: string
  IS_FINAL: boolean
  ORDER_INDEX: number
  STATE: string
}

export interface WorkOrderServiceLine {
  SERVICE_LINE_ID?: number
  SERVICE_TYPE: string
  DESCRIPTION: string
  QUANTITY: number
  REFERENCE_AMOUNT: number
  NOTES?: string
}

export interface WorkOrderConsumedItem {
  CONSUMED_ITEM_ID?: number
  ARTICLE_ID: number
  ARTICLE_CODE?: string
  ARTICLE_NAME?: string
  QUANTITY: number
  UNIT_COST_REFERENCE?: number | null
  NOTES?: string
}

export interface WorkOrderTechnician {
  WORK_ORDER_TECHNICIAN_ID?: number
  STAFF_ID: number
  STAFF_NAME?: string
  ROLE_ON_JOB?: string
  IS_LEAD?: boolean
  REFERENCE_PERCENT?: number | null
  REFERENCE_AMOUNT?: number | null
  NOTES?: string
}

export interface WorkOrderStatusHistory {
  HISTORY_ID: number
  STATUS_ID: number
  STATUS_CODE: string
  STATUS_NAME: string
  CHANGED_BY_STAFF_ID: number
  CHANGED_BY_NAME: string
  CHANGED_AT: string
  NOTES?: string
}

export interface WorkOrder {
  WORK_ORDER_ID: number
  ORDER_NO: string
  CUSTOMER_ID: number
  CUSTOMER_NAME: string
  VEHICLE_ID: number
  VEHICLE_LABEL: string
  STATUS_ID: number
  STATUS_CODE: string
  STATUS_NAME: string
  RECEIVED_BY_STAFF_ID: number
  RECEIVED_BY_NAME: string
  DELIVERED_BY_STAFF_ID: number | null
  DELIVERED_BY_NAME: string
  OPENED_AT: string
  PROMISED_AT: string | null
  CLOSED_AT: string | null
  CANCELLED_AT: string | null
  SYMPTOM: string
  DIAGNOSIS: string
  WORK_PERFORMED: string
  INTERNAL_NOTES: string
  CUSTOMER_OBSERVATIONS: string
  REQUIRES_DISASSEMBLY: boolean
  TECHNICIAN_NAMES?: string
  STATE: string
  SERVICE_LINES?: WorkOrderServiceLine[]
  CONSUMED_ITEMS?: WorkOrderConsumedItem[]
  TECHNICIANS?: WorkOrderTechnician[]
  STATUS_HISTORY?: WorkOrderStatusHistory[]
  CREATED_AT?: string | null
}

export interface WorkOrderPayload {
  CUSTOMER_ID: number
  VEHICLE_ID: number
  STATUS_ID?: number
  PROMISED_AT?: string | null
  SYMPTOM: string
  DIAGNOSIS?: string | null
  WORK_PERFORMED?: string | null
  INTERNAL_NOTES?: string | null
  CUSTOMER_OBSERVATIONS?: string | null
  REQUIRES_DISASSEMBLY?: boolean
  STATUS_CHANGE_NOTES?: string | null
  SERVICE_LINES?: WorkOrderServiceLine[]
  CONSUMED_ITEMS?: WorkOrderConsumedItem[]
  TECHNICIANS?: WorkOrderTechnician[]
  STATE?: 'A' | 'I'
}

export interface UpdateWorkOrderPayload extends Partial<WorkOrderPayload> {
  WORK_ORDER_ID: number
}
