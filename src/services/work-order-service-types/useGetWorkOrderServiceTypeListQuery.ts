import { useQuery } from '@tanstack/react-query'
import { getRequest } from '../api'
import { API_PATH_GET_WORK_ORDER_SERVICE_TYPE_LIST } from 'src/constants/routes'
import { WorkOrderServiceType } from './work-order-service-type.types'

export function useGetWorkOrderServiceTypeListQuery() {
  return useQuery<WorkOrderServiceType[]>({
    queryKey: ['work-order-service-types', 'list'],
    queryFn: async () => {
      const {
        data: { data },
      } = await getRequest<WorkOrderServiceType[]>(
        API_PATH_GET_WORK_ORDER_SERVICE_TYPE_LIST
      )

      return data || []
    },
    staleTime: 5 * 60 * 1000,
  })
}
