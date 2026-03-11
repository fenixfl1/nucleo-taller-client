import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import {
  GetInventoryReplenishmentPayload,
  InventoryReplenishmentSummary,
} from './inventory-replenishment.types'
import { getQueryString, postRequest } from '../api'
import { API_PATH_GET_INVENTORY_REPLENISHMENT_SUMMARY } from 'src/constants/routes'

const initialData: InventoryReplenishmentSummary = {
  BELOW_MINIMUM_COUNT: 0,
  ACTIONABLE_COUNT: 0,
  TOTAL_SUGGESTED_QUANTITY: 0,
  ESTIMATED_VALUE: 0,
  MONTH_WINDOW: 3,
}

export function useGetInventoryReplenishmentSummaryMutation() {
  return useCustomMutation<
    InventoryReplenishmentSummary,
    GetInventoryReplenishmentPayload
  >({
    initialData,
    mutationKey: ['inventory-replenishment', 'summary'],
    mutationFn: async ({ condition, months = 3 }) => {
      const { data } = await postRequest<InventoryReplenishmentSummary>(
        getQueryString(API_PATH_GET_INVENTORY_REPLENISHMENT_SUMMARY, {
          months,
        }),
        condition
      )

      return data?.data || initialData
    },
  })
}
