import { useQuery } from '@tanstack/react-query'
import { getRequest } from '../api'
import { API_PATH_GET_ONE_INTERNAL_PURCHASE_ORDER } from 'src/constants/routes'
import { useInternalPurchaseOrderStore } from 'src/store/internal-purchase-order.store'
import { InternalPurchaseOrder } from './internal-purchase-order.types'

export function useGetOneInternalPurchaseOrderQuery(
  internalPurchaseOrderId?: number,
  enabled = true
) {
  const { setInternalPurchaseOrder } = useInternalPurchaseOrderStore()

  return useQuery<InternalPurchaseOrder>({
    enabled: Boolean(internalPurchaseOrderId) && enabled,
    queryKey: [
      'internal-purchase-orders',
      'get-one-internal-purchase-order',
      internalPurchaseOrderId,
    ],
    queryFn: async () => {
      const {
        data: { data },
      } = await getRequest<InternalPurchaseOrder>(
        `${API_PATH_GET_ONE_INTERNAL_PURCHASE_ORDER}${internalPurchaseOrderId}`
      )

      setInternalPurchaseOrder(data)
      return data
    },
  })
}
