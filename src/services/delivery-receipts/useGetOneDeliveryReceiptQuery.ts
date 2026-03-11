import { useQuery } from '@tanstack/react-query'
import { getRequest } from '../api'
import { API_PATH_GET_ONE_DELIVERY_RECEIPT } from 'src/constants/routes'
import { useDeliveryReceiptStore } from 'src/store/delivery-receipt.store'
import { DeliveryReceipt } from './delivery-receipt.types'

export function useGetOneDeliveryReceiptQuery(
  receiptId?: number,
  enabled = true
) {
  const { setDeliveryReceipt } = useDeliveryReceiptStore()

  return useQuery<DeliveryReceipt>({
    enabled: Boolean(receiptId) && enabled,
    queryKey: ['delivery-receipts', 'get-one-delivery-receipt', receiptId],
    queryFn: async () => {
      const {
        data: { data },
      } = await getRequest<DeliveryReceipt>(
        `${API_PATH_GET_ONE_DELIVERY_RECEIPT}${receiptId}`
      )

      setDeliveryReceipt(data)
      return data
    },
  })
}
