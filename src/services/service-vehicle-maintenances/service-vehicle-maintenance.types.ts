export type ServiceVehicleMaintenanceType =
  | 'PREVENTIVO'
  | 'CORRECTIVO'
  | 'INSPECCION'
  | 'CAMBIO_PIEZA'
  | 'OTRO'

export type ServiceVehicleMaintenancePriority = 'BAJA' | 'MEDIA' | 'ALTA'

export type ServiceVehicleMaintenanceStatus =
  | 'PENDIENTE'
  | 'EN_PROCESO'
  | 'COMPLETADO'
  | 'CANCELADO'

export interface ServiceVehicleMaintenance {
  SERVICE_VEHICLE_MAINTENANCE_ID: number
  SERVICE_VEHICLE_ID: number
  VEHICLE_NAME: string
  VEHICLE_LABEL: string
  MAINTENANCE_TYPE: ServiceVehicleMaintenanceType
  PRIORITY: ServiceVehicleMaintenancePriority
  STATUS: ServiceVehicleMaintenanceStatus
  TITLE: string
  DESCRIPTION: string
  SCHEDULED_AT: string | null
  PERFORMED_AT: string | null
  ODOMETER: number | null
  COST_REFERENCE: number | null
  NOTES: string
  STATE: string
  CREATED_AT?: string | null
}
