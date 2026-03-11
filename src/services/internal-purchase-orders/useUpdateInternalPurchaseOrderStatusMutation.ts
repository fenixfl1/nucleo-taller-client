import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { putRequest } from '../api'
import { API_PATH_UPDATE_INTERNAL_PURCHASE_ORDER_STATUS } from 'src/constants/routes'
import {
  InternalPurchaseOrder,
  UpdateInternalPurchaseOrderStatusPayload,
} from './internal-purchase-order.types'

export function useUpdateInternalPurchaseOrderStatusMutation() {
  return useCustomMutation<
    InternalPurchaseOrder,
    UpdateInternalPurchaseOrderStatusPayload
  >({
    initialData: {} as InternalPurchaseOrder,
    mutationKey: ['internal-purchase-order', 'update-status'],
    mutationFn: async (payload) => {
      const {
        data: { data },
      } = await putRequest<InternalPurchaseOrder>(
        API_PATH_UPDATE_INTERNAL_PURCHASE_ORDER_STATUS,
        payload
      )

      return data
    },
  })
}
