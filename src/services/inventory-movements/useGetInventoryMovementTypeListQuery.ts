import { useQuery } from '@tanstack/react-query'
import { getRequest } from '../api'
import { API_PATH_GET_INVENTORY_MOVEMENT_TYPE_LIST } from 'src/constants/routes'
import { InventoryMovementType } from './inventory-movement.types'

export function useGetInventoryMovementTypeListQuery() {
  return useQuery<InventoryMovementType[]>({
    queryKey: ['inventory-movements', 'type-list'],
    queryFn: async () => {
      const {
        data: { data },
      } = await getRequest<InventoryMovementType[]>(
        API_PATH_GET_INVENTORY_MOVEMENT_TYPE_LIST
      )

      return data || []
    },
    staleTime: 5 * 60 * 1000,
  })
}
