import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { GetPayload, ReturnPayload } from 'src/types/general'
import { WorkOrderServiceType } from './work-order-service-type.types'
import { getQueryString, postRequest } from '../api'
import { API_PATH_GET_WORK_ORDER_SERVICE_TYPE_PAGINATION } from 'src/constants/routes'
import { useWorkOrderServiceTypeStore } from 'src/store/work-order-service-type.store'

const initialData: ReturnPayload<WorkOrderServiceType> = {
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

export function useGetWorkOrderServiceTypePaginationMutation() {
  const { setWorkOrderServiceTypeList } = useWorkOrderServiceTypeStore()

  return useCustomMutation<
    ReturnPayload<WorkOrderServiceType>,
    GetPayload<WorkOrderServiceType>
  >({
    initialData,
    mutationKey: ['work-order-service-types', 'pagination'],
    onSuccess: setWorkOrderServiceTypeList,
    onError: () => setWorkOrderServiceTypeList(initialData),
    mutationFn: async ({ condition, page, size }) => {
      const { data } = await postRequest<WorkOrderServiceType[]>(
        getQueryString(API_PATH_GET_WORK_ORDER_SERVICE_TYPE_PAGINATION, {
          page,
          size,
        }),
        condition
      )

      return data || initialData
    },
  })
}
