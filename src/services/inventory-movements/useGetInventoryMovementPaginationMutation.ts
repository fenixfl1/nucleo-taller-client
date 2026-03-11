import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { GetPayload, ReturnPayload } from 'src/types/general'
import { InventoryMovement } from './inventory-movement.types'
import { getQueryString, postRequest } from '../api'
import { API_PATH_GET_INVENTORY_MOVEMENT_PAGINATION } from 'src/constants/routes'
import { useInventoryMovementStore } from 'src/store/inventory-movement.store'

const initialData: ReturnPayload<InventoryMovement> = {
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

export function useGetInventoryMovementPaginationMutation() {
  const { setInventoryMovementList } = useInventoryMovementStore()

  return useCustomMutation<
    ReturnPayload<InventoryMovement>,
    GetPayload<InventoryMovement>
  >({
    initialData,
    mutationKey: ['inventory-movements', 'pagination'],
    onSuccess: setInventoryMovementList,
    onError: () => setInventoryMovementList(initialData),
    mutationFn: async ({ condition, page, size }) => {
      const { data } = await postRequest<InventoryMovement[]>(
        getQueryString(API_PATH_GET_INVENTORY_MOVEMENT_PAGINATION, {
          page,
          size,
        }),
        condition
      )

      return data || initialData
    },
  })
}
