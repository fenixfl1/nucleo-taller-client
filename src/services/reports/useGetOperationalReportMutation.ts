import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { postRequest } from 'src/services/api'
import { API_PATH_GET_OPERATIONAL_REPORT } from 'src/constants/routes'
import { GetOperationalReportPayload, OperationalReport } from './report.types'

const initialData: OperationalReport = {
  FILTERS: {
    START_DATE: null,
    END_DATE: null,
  },
  SUMMARY: {
    OPENED_WORK_ORDERS: 0,
    DELIVERED_WORK_ORDERS: 0,
    CANCELLED_WORK_ORDERS: 0,
    DELIVERY_RECEIPTS: 0,
    INVENTORY_CONSUMPTION_QUANTITY: 0,
    ARTICLES_BELOW_MINIMUM: 0,
    AVERAGE_CLOSURE_DAYS: 0,
  },
  WORK_ORDERS_BY_STATUS: [],
  TOP_CONSUMED_ARTICLES: [],
  LOW_STOCK_ARTICLES: [],
  TOP_TECHNICIANS: [],
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
