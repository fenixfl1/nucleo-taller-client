import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { GetPayload, ReturnPayload } from 'src/types/general'
import { WorkOrder } from './work-order.types'
import { getQueryString, postRequest } from '../api'
import { API_PATH_GET_WORK_ORDER_PAGINATION } from 'src/constants/routes'
import { useWorkOrderStore } from 'src/store/work-order.store'

const initialData: ReturnPayload<WorkOrder> = {
  data: [],
  metadata: {
    pagination: {
      currentPage: 1,
      totalPages: 0,
      totalRows: 0,
      count: 0,
      pageSize: 15,
      links: undefined,
    },
  },
}

export function useGetWorkOrderPaginationMutation() {
  const { setWorkOrderList } = useWorkOrderStore()

  return useCustomMutation<ReturnPayload<WorkOrder>, GetPayload<WorkOrder>>({
    initialData,
    mutationKey: ['work-orders', 'pagination'],
    onSuccess: setWorkOrderList,
    onError: () => setWorkOrderList(initialData),
    mutationFn: async ({ condition, page, size }) => {
      const { data } = await postRequest<WorkOrder[]>(
        getQueryString(API_PATH_GET_WORK_ORDER_PAGINATION, { page, size }),
        condition
      )

      return data || initialData
    },
  })
}
