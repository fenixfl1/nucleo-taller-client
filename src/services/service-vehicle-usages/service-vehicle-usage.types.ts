export type ServiceVehicleUsageStatus =
  | 'EN_CURSO'
  | 'FINALIZADA'
  | 'CANCELADA'

export interface ServiceVehicleUsage {
  SERVICE_VEHICLE_USAGE_ID: number
  SERVICE_VEHICLE_ID: number
  STAFF_ID: number | null
  VEHICLE_NAME: string
  VEHICLE_LABEL: string
  EMPLOYEE_NAME: string
  STATUS: ServiceVehicleUsageStatus
  PURPOSE: string
  ORIGIN: string
  DESTINATION: string
  STARTED_AT: string | null
  ENDED_AT: string | null
  ODOMETER_START: number | null
  ODOMETER_END: number | null
  NOTES: string
  STATE: string
  CREATED_AT?: string | null
}
