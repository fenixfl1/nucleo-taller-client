import { DeliveryReceipt } from 'src/services/delivery-receipts/delivery-receipt.types'
import { InventoryMovement } from 'src/services/inventory-movements/inventory-movement.types'
import { WorkOrder } from 'src/services/work-orders/work-order.types'

export interface WorkshopDashboardSummary {
  activeCustomers: number
  activeVehicles: number
  activeArticles: number
  activeWorkOrders: number
  readyForDelivery: number
  totalDeliveries: number
}

export interface WorkshopDashboardSnapshot {
  summary: WorkshopDashboardSummary
  inProgressOrders: WorkOrder[]
  readyForDeliveryOrders: WorkOrder[]
  recentMovements: InventoryMovement[]
  recentDeliveries: DeliveryReceipt[]
}
