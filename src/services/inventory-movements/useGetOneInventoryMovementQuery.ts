import { useQuery } from '@tanstack/react-query'
import { getRequest } from '../api'
import { API_PATH_GET_ONE_INVENTORY_MOVEMENT } from 'src/constants/routes'
import { InventoryMovement } from './inventory-movement.types'
import { useInventoryMovementStore } from 'src/store/inventory-movement.store'

export function useGetOneInventoryMovementQuery(
  movementId?: number,
  enabled = true
) {
  const { setInventoryMovement } = useInventoryMovementStore()

  return useQuery<InventoryMovement>({
    enabled: Boolean(movementId) && enabled,
    queryKey: ['inventory-movements', 'get-one-inventory-movement', movementId],
    queryFn: async () => {
      const {
        data: { data },
      } = await getRequest<InventoryMovement>(
        `${API_PATH_GET_ONE_INVENTORY_MOVEMENT}${movementId}`
      )

      setInventoryMovement(data)

      return data
    },
  })
}
