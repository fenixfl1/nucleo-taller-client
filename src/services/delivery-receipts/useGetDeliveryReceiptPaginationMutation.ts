import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { GetPayload, ReturnPayload } from 'src/types/general'
import { DeliveryReceipt } from './delivery-receipt.types'
import { getQueryString, postRequest } from '../api'
import { API_PATH_GET_DELIVERY_RECEIPT_PAGINATION } from 'src/constants/routes'
import { useDeliveryReceiptStore } from 'src/store/delivery-receipt.store'

const initialData: ReturnPayload<DeliveryReceipt> = {
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

export function useGetDeliveryReceiptPaginationMutation() {
  const { setDeliveryReceiptList } = useDeliveryReceiptStore()

  return useCustomMutation<
    ReturnPayload<DeliveryReceipt>,
    GetPayload<DeliveryReceipt>
  >({
    initialData,
    mutationKey: ['delivery-receipts', 'pagination'],
    onSuccess: setDeliveryReceiptList,
    onError: () => setDeliveryReceiptList(initialData),
    mutationFn: async ({ condition, page, size }) => {
      const { data } = await postRequest<DeliveryReceipt[]>(
        getQueryString(API_PATH_GET_DELIVERY_RECEIPT_PAGINATION, { page, size }),
        condition
      )

      return data || initialData
    },
  })
}
