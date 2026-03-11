import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { ReturnPayload } from 'src/types/general'
import {
  GetInventoryReplenishmentPayload,
  InventoryReplenishment,
} from './inventory-replenishment.types'
import { getQueryString, postRequest } from '../api'
import { API_PATH_GET_INVENTORY_REPLENISHMENT_PAGINATION } from 'src/constants/routes'
import { useInventoryReplenishmentStore } from 'src/store/inventory-replenishment.store'

const initialData: ReturnPayload<InventoryReplenishment> = {
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

export function useGetInventoryReplenishmentPaginationMutation() {
  const { setInventoryReplenishmentList } = useInventoryReplenishmentStore()

  return useCustomMutation<
    ReturnPayload<InventoryReplenishment>,
    GetInventoryReplenishmentPayload
  >({
    initialData,
    mutationKey: ['inventory-replenishment', 'pagination'],
    onSuccess: setInventoryReplenishmentList,
    onError: () => setInventoryReplenishmentList(initialData),
    mutationFn: async ({ condition, page, size, months = 3 }) => {
      const { data } = await postRequest<InventoryReplenishment[]>(
        getQueryString(API_PATH_GET_INVENTORY_REPLENISHMENT_PAGINATION, {
          page,
          size,
          months,
        }),
        condition
      )

      return data || initialData
    },
  })
}
