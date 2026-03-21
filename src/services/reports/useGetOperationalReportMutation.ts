import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { postRequest } from 'src/services/api'
import { API_PATH_GET_OPERATIONAL_REPORT } from 'src/constants/routes'
import { GetOperationalReportPayload, OperationalReport } from './report.types'

const initialData: OperationalReport = {
  FILTERS: {
    START_DATE: null,
    END_DATE: null,
    EMPLOYEE_TYPE: null,
    STAFF_ID: null,
    STAFF_LABEL: null,
  },
  SUMMARY: {
    OPENED_WORK_ORDERS: 0,
    DELIVERED_WORK_ORDERS: 0,
    CANCELLED_WORK_ORDERS: 0,
    DELIVERY_RECEIPTS: 0,
    ACTIVE_SERVICE_VEHICLES: 0,
    INVENTORY_CONSUMPTION_QUANTITY: 0,
    ARTICLES_BELOW_MINIMUM: 0,
    AVERAGE_CLOSURE_DAYS: 0,
    SERVICE_VEHICLE_HISTORY_EVENTS: 0,
    PENDING_SERVICE_VEHICLE_MAINTENANCE: 0,
    OVERDUE_SERVICE_VEHICLE_MAINTENANCE: 0,
    AVAILABLE_SERVICE_VEHICLES: 0,
    TOTAL_SERVICE_VEHICLE_USAGE_HOURS: 0,
    TOTAL_SERVICE_VEHICLE_USAGE_KILOMETERS: 0,
  },
  WORK_ORDERS_BY_STATUS: [],
  TOP_CONSUMED_ARTICLES: [],
  LOW_STOCK_ARTICLES: [],
  TOP_TECHNICIANS: [],
  SERVICE_VEHICLES_BY_STATE: [],
  SERVICE_VEHICLE_FLEET: [],
  SERVICE_VEHICLE_HISTORY: [],
  SERVICE_VEHICLE_MAINTENANCE_BY_VEHICLE: [],
  SERVICE_VEHICLE_USAGE_BY_VEHICLE: [],
  SERVICE_VEHICLE_AVAILABILITY: [],
}

export function useGetOperationalReportMutation() {
  return useCustomMutation<OperationalReport, GetOperationalReportPayload>({
    initialData,
    mutationKey: ['report', 'operational'],
    mutationFn: async (payload) => {
      const { data } = await postRequest<OperationalReport>(
        API_PATH_GET_OPERATIONAL_REPORT,
        payload
      )

      return data?.data || initialData
    },
  })
}
