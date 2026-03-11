import { useQuery } from '@tanstack/react-query'
import { getRequest } from '../api'
import { API_PATH_GET_ONE_WORK_ORDER } from 'src/constants/routes'
import { useWorkOrderStore } from 'src/store/work-order.store'
import { WorkOrder } from './work-order.types'

export function useGetOneWorkOrderQuery(workOrderId?: number, enabled = true) {
  const { setWorkOrder } = useWorkOrderStore()

  return useQuery<WorkOrder>({
    enabled: Boolean(workOrderId) && enabled,
    queryKey: ['work-orders', 'get-one-work-order', workOrderId],
    queryFn: async () => {
      const {
        data: { data },
      } = await getRequest<WorkOrder>(`${API_PATH_GET_ONE_WORK_ORDER}${workOrderId}`)

      setWorkOrder(data)

      return data
    },
  })
}
