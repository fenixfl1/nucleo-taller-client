export interface OperationalReportSummary {
  OPENED_WORK_ORDERS: number
  DELIVERED_WORK_ORDERS: number
  CANCELLED_WORK_ORDERS: number
  DELIVERY_RECEIPTS: number
  INVENTORY_CONSUMPTION_QUANTITY: number
  ARTICLES_BELOW_MINIMUM: number
  AVERAGE_CLOSURE_DAYS: number
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
}

export interface OperationalReport {
  FILTERS: {
    START_DATE: string | null
    END_DATE: string | null
  }
  SUMMARY: OperationalReportSummary
  WORK_ORDERS_BY_STATUS: WorkOrdersByStatusReportItem[]
  TOP_CONSUMED_ARTICLES: TopConsumedArticleReportItem[]
  LOW_STOCK_ARTICLES: LowStockArticleReportItem[]
  TOP_TECHNICIANS: TopTechnicianReportItem[]
}

export interface GetOperationalReportPayload {
  START_DATE?: string | null
  END_DATE?: string | null
}
