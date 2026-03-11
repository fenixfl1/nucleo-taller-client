import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { GetPayload, ReturnPayload } from 'src/types/general'
import { getQueryString, postRequest } from '../api'
import { API_PATH_GET_INTERNAL_PURCHASE_ORDER_PAGINATION } from 'src/constants/routes'
import { useInternalPurchaseOrderStore } from 'src/store/internal-purchase-order.store'
import { InternalPurchaseOrder } from './internal-purchase-order.types'

const initialData: ReturnPayload<InternalPurchaseOrder> = {
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

export function useGetInternalPurchaseOrderPaginationMutation() {
  const { setInternalPurchaseOrderList } = useInternalPurchaseOrderStore()

  return useCustomMutation<
    ReturnPayload<InternalPurchaseOrder>,
    GetPayload<InternalPurchaseOrder>
  >({
    initialData,
    mutationKey: ['internal-purchase-orders', 'pagination'],
    onSuccess: setInternalPurchaseOrderList,
    onError: () => setInternalPurchaseOrderList(initialData),
    mutationFn: async ({ condition, page, size }) => {
      const { data } = await postRequest<InternalPurchaseOrder[]>(
        getQueryString(API_PATH_GET_INTERNAL_PURCHASE_ORDER_PAGINATION, {
          page,
          size,
        }),
        condition
      )

      return data || initialData
    },
  })
}
