import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { postRequest } from '../api'
import { API_PATH_CREATE_INVENTORY_MOVEMENT } from 'src/constants/routes'
import {
  InventoryMovement,
  InventoryMovementPayload,
} from './inventory-movement.types'

export function useCreateInventoryMovementMutation() {
  return useCustomMutation<InventoryMovement, InventoryMovementPayload>({
    initialData: <InventoryMovement>{},
    mutationKey: ['inventory-movements', 'create-inventory-movement'],
    mutationFn: async (payload) => {
      const {
        data: { data },
      } = await postRequest<InventoryMovement>(
        API_PATH_CREATE_INVENTORY_MOVEMENT,
        payload
      )

      return data
    },
  })
}
