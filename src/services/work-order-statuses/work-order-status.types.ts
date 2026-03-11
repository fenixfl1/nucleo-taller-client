export interface WorkOrderStatusCatalog {
  STATUS_ID: number
  CODE: string
  NAME: string
  DESCRIPTION: string
  IS_FINAL: boolean
  ORDER_INDEX: number
  STATE: string
  SCOPE: 'BASE' | 'EMPRESA'
  CREATED_AT?: string | null
}

export interface WorkOrderStatusCatalogPayload {
  CODE: string
  NAME: string
  DESCRIPTION?: string | null
  IS_FINAL?: boolean
  ORDER_INDEX?: number
  STATE?: 'A' | 'I'
}

export interface UpdateWorkOrderStatusCatalogPayload
  extends Partial<WorkOrderStatusCatalogPayload> {
  STATUS_ID: number
}
