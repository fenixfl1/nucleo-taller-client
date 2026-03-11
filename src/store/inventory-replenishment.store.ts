import { create } from 'zustand'
import { Metadata, ReturnPayload } from 'src/types/general'
import { InventoryReplenishment } from 'src/services/inventory-replenishment/inventory-replenishment.types'

interface UseInventoryReplenishmentStore {
  inventoryReplenishmentList: InventoryReplenishment[]
  metadata: Metadata
  setInventoryReplenishmentList: (
    payload: ReturnPayload<InventoryReplenishment>
  ) => void
}

export const useInventoryReplenishmentStore =
  create<UseInventoryReplenishmentStore>((set) => ({
    inventoryReplenishmentList: [],
    metadata: {
      currentPage: 1,
      pageSize: 15,
      count: 0,
      totalPages: 0,
      totalRows: 0,
      links: undefined,
    },
    setInventoryReplenishmentList: ({ data, metadata }) =>
      set({
        inventoryReplenishmentList: data,
        metadata: metadata.pagination,
      }),
  }))
