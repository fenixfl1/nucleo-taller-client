export interface OperationalReportSummary {
  OPENED_WORK_ORDERS: number
  DELIVERED_WORK_ORDERS: number
  CANCELLED_WORK_ORDERS: number
  DELIVERY_RECEIPTS: number
  INVENTORY_CONSUMPTION_QUANTITY: number
  ARTICLES_BELOW_MINIMUM: number
  AVERAGE_CLOSURE_DAYS: number
  ACTIVE_SERVICE_VEHICLES: number
  SERVICE_VEHICLE_HISTORY_EVENTS: number
  PENDING_SERVICE_VEHICLE_MAINTENANCE: number
  OVERDUE_SERVICE_VEHICLE_MAINTENANCE: number
  AVAILABLE_SERVICE_VEHICLES: number
  TOTAL_SERVICE_VEHICLE_USAGE_HOURS: number
  TOTAL_SERVICE_VEHICLE_USAGE_KILOMETERS: number
}

export interface WorkOrdersByStatusReportItem {
  STATUS_CODE: string
  STATUS_NAME: string
  TOTAL: number
}

export interface TopConsumedArticleReportItem {
  ARTICLE_ID: number
  ARTICLE_CODE: string
  ARTICLE_NAME: string
  TOTAL_QUANTITY: number
  MOVEMENT_COUNT: number
  TOTAL_ESTIMATED_COST: number
}

export interface LowStockArticleReportItem {
  ARTICLE_ID: number
  CODE: string
  NAME: string
  ITEM_TYPE: string
  CURRENT_STOCK: number
  MIN_STOCK: number
  DEFICIT: number
  COST_REFERENCE: number | null
}

export interface TopTechnicianReportItem {
  STAFF_ID: number
  USERNAME: string
  FULL_NAME: string
  TOTAL_ASSIGNED_ORDERS: number
  LEAD_ORDERS: number
  DELIVERED_ORDERS: number
  TOTAL_SERVICE_LINES: number
  TOTAL_REFERENCE_AMOUNT: number
}

export interface ServiceVehiclesByStateReportItem {
  STATE: string
  TOTAL: number
}

export interface ServiceVehicleFleetReportItem {
  BRAND: string
  MODEL: string
  TOTAL: number
}

export interface ServiceVehicleHistoryReportItem {
  ID: number
  ACTION: string
  VEHICLE_NAME: string
  PLATE: string
  ACTOR_NAME: string
  USERNAME: string
  EMPLOYEE_TYPE: string
  CREATED_AT: string | null
}

export interface ServiceVehicleMaintenanceByVehicleReportItem {
  SERVICE_VEHICLE_ID: number
  VEHICLE_NAME: string
  PLATE: string
  PENDING_TOTAL: number
  OVERDUE_TOTAL: number
  NEXT_SCHEDULED_AT: string | null
}

export interface ServiceVehicleUsageByVehicleReportItem {
  SERVICE_VEHICLE_ID: number
  VEHICLE_NAME: string
  PLATE: string
  TOTAL_USAGES: number
  TOTAL_HOURS: number
  TOTAL_KILOMETERS: number
  LAST_USAGE_AT: string | null
}

export interface ServiceVehicleAvailabilityReportItem {
  SERVICE_VEHICLE_ID: number
  VEHICLE_NAME: string
  PLATE: string
  BRAND: string
  MODEL: string
  AVAILABILITY_STATUS: string
  CURRENT_USAGE_COUNT: number
  OPEN_MAINTENANCE_COUNT: number
  IN_PROGRESS_MAINTENANCE_COUNT: number
}

export interface OperationalReport {
  FILTERS: {
    START_DATE: string | null
    END_DATE: string | null
    EMPLOYEE_TYPE: 'OPERACIONAL' | 'ADMINISTRATIVO' | null
    STAFF_ID: number | null
    STAFF_LABEL: string | null
  }
  SUMMARY: OperationalReportSummary
  WORK_ORDERS_BY_STATUS: WorkOrdersByStatusReportItem[]
  TOP_CONSUMED_ARTICLES: TopConsumedArticleReportItem[]
  LOW_STOCK_ARTICLES: LowStockArticleReportItem[]
  TOP_TECHNICIANS: TopTechnicianReportItem[]
  SERVICE_VEHICLES_BY_STATE: ServiceVehiclesByStateReportItem[]
  SERVICE_VEHICLE_FLEET: ServiceVehicleFleetReportItem[]
  SERVICE_VEHICLE_HISTORY: ServiceVehicleHistoryReportItem[]
  SERVICE_VEHICLE_MAINTENANCE_BY_VEHICLE: ServiceVehicleMaintenanceByVehicleReportItem[]
  SERVICE_VEHICLE_USAGE_BY_VEHICLE: ServiceVehicleUsageByVehicleReportItem[]
  SERVICE_VEHICLE_AVAILABILITY: ServiceVehicleAvailabilityReportItem[]
}

export interface GetOperationalReportPayload {
  START_DATE?: string | null
  END_DATE?: string | null
  EMPLOYEE_TYPE?: 'OPERACIONAL' | 'ADMINISTRATIVO' | null
  STAFF_ID?: number | null
}
