export interface WorkOrderServiceType {
  SERVICE_TYPE_ID: number
  CODE: string
  NAME: string
  DESCRIPTION: string
  ORDER_INDEX: number
  STATE: string
  SCOPE: 'BASE' | 'EMPRESA'
  CREATED_AT?: string | null
}

export interface WorkOrderServiceTypePayload {
  CODE: string
  NAME: string
  DESCRIPTION?: string | null
  ORDER_INDEX?: number
  STATE?: 'A' | 'I'
}

export interface UpdateWorkOrderServiceTypePayload
  extends Partial<WorkOrderServiceTypePayload> {
  SERVICE_TYPE_ID: number
}
