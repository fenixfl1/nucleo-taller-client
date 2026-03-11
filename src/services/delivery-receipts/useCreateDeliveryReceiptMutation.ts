import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { postRequest } from '../api'
import { API_PATH_CREATE_DELIVERY_RECEIPT } from 'src/constants/routes'
import {
  DeliveryReceipt,
  DeliveryReceiptPayload,
} from './delivery-receipt.types'

export function useCreateDeliveryReceiptMutation() {
  return useCustomMutation<DeliveryReceipt, DeliveryReceiptPayload>({
    initialData: <DeliveryReceipt>{},
    mutationKey: ['delivery-receipts', 'create-delivery-receipt'],
    mutationFn: async (payload) => {
      const {
        data: { data },
      } = await postRequest<DeliveryReceipt>(API_PATH_CREATE_DELIVERY_RECEIPT, payload)

      return data
    },
  })
}
