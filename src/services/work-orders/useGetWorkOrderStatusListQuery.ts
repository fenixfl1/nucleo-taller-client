import { useQuery } from '@tanstack/react-query'
import { getRequest } from '../api'
import { API_PATH_GET_WORK_ORDER_STATUS_LIST } from 'src/constants/routes'
import { WorkOrderStatus } from './work-order.types'

export function useGetWorkOrderStatusListQuery() {
  return useQuery<WorkOrderStatus[]>({
    queryKey: ['work-orders', 'status-list'],
    queryFn: async () => {
      const {
        data: { data },
      } = await getRequest<WorkOrderStatus[]>(API_PATH_GET_WORK_ORDER_STATUS_LIST)

      return data || []
    },
    staleTime: 5 * 60 * 1000,
  })
}
