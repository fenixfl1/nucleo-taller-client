import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { GetPayload, ReturnPayload } from 'src/types/general'
import { WorkOrderStatusCatalog } from './work-order-status.types'
import { getQueryString, postRequest } from '../api'
import { API_PATH_GET_WORK_ORDER_STATUS_PAGINATION } from 'src/constants/routes'
import { useWorkOrderStatusStore } from 'src/store/work-order-status.store'

const initialData: ReturnPayload<WorkOrderStatusCatalog> = {
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

export function useGetWorkOrderStatusPaginationMutation() {
  const { setWorkOrderStatusList } = useWorkOrderStatusStore()

  return useCustomMutation<
    ReturnPayload<WorkOrderStatusCatalog>,
    GetPayload<WorkOrderStatusCatalog>
  >({
    initialData,
    mutationKey: ['work-order-statuses', 'pagination'],
    onSuccess: setWorkOrderStatusList,
    onError: () => setWorkOrderStatusList(initialData),
    mutationFn: async ({ condition, page, size }) => {
      const { data } = await postRequest<WorkOrderStatusCatalog[]>(
        getQueryString(API_PATH_GET_WORK_ORDER_STATUS_PAGINATION, { page, size }),
        condition
      )

      return data || initialData
    },
  })
}
