import { DeliveryReceipt } from 'src/services/delivery-receipts/delivery-receipt.types'
import { InventoryMovement } from 'src/services/inventory-movements/inventory-movement.types'
import { WorkOrder } from 'src/services/work-orders/work-order.types'

export interface WorkshopDashboardSummary {
  activeCustomers: number
  activeVehicles: number
  activeServiceVehicles: number
  activeArticles: number
  activeWorkOrders: number
  readyForDelivery: number
  totalDeliveries: number
  availableServiceVehicles: number
  pendingServiceVehicleMaintenance: number
  overdueServiceVehicleMaintenance: number
  totalServiceVehicleUsageHours: number
  totalServiceVehicleUsageKilometers: number
}

export interface ServiceVehicleDashboardItem {
  SERVICE_VEHICLE_ID: number
  NAME: string
  PLATE: string
  BRAND: string
  MODEL: string
  STATE: string
  CREATED_AT: string | null
}

export interface FleetMaintenanceAlertDashboardItem {
  SERVICE_VEHICLE_ID: number
  VEHICLE_NAME: string
  PLATE: string
  PENDING_TOTAL: number
  OVERDUE_TOTAL: number
  NEXT_SCHEDULED_AT: string | null
}

export interface FleetUsageSummaryDashboardItem {
  SERVICE_VEHICLE_ID: number
  VEHICLE_NAME: string
  PLATE: string
  TOTAL_USAGES: number
  TOTAL_HOURS: number
  TOTAL_KILOMETERS: number
  LAST_USAGE_AT: string | null
}

export interface FleetAvailabilityDashboardItem {
  SERVICE_VEHICLE_ID: number
  VEHICLE_NAME: string
  PLATE: string
  BRAND: string
  MODEL: string
  AVAILABILITY_STATUS: string
  CURRENT_USAGE_COUNT: number
  OPEN_MAINTENANCE_COUNT: number
}

export interface WorkshopDashboardSnapshot {
  summary: WorkshopDashboardSummary
  inProgressOrders: WorkOrder[]
  readyForDeliveryOrders: WorkOrder[]
  recentMovements: InventoryMovement[]
  recentDeliveries: DeliveryReceipt[]
  recentServiceVehicles: ServiceVehicleDashboardItem[]
  fleetMaintenanceAlerts: FleetMaintenanceAlertDashboardItem[]
  fleetUsageSummary: FleetUsageSummaryDashboardItem[]
  fleetAvailability: FleetAvailabilityDashboardItem[]
}
