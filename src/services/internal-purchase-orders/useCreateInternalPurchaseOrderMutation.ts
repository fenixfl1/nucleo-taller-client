import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { postRequest } from '../api'
import { API_PATH_CREATE_INTERNAL_PURCHASE_ORDER } from 'src/constants/routes'
import {
  InternalPurchaseOrder,
  InternalPurchaseOrderPayload,
} from './internal-purchase-order.types'

export function useCreateInternalPurchaseOrderMutation() {
  return useCustomMutation<
    InternalPurchaseOrder,
    InternalPurchaseOrderPayload
  >({
    initialData: {} as InternalPurchaseOrder,
    mutationKey: ['internal-purchase-order', 'create'],
    mutationFn: async (payload) => {
      const {
        data: { data },
      } = await postRequest<InternalPurchaseOrder>(
        API_PATH_CREATE_INTERNAL_PURCHASE_ORDER,
        payload
      )

      return data
    },
  })
}
