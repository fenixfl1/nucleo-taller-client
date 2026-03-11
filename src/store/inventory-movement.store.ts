import { create } from 'zustand'
import { Metadata, ReturnPayload } from 'src/types/general'
import { InventoryMovement } from 'src/services/inventory-movements/inventory-movement.types'

interface UseInventoryMovementStore {
  inventoryMovement: InventoryMovement
  inventoryMovementList: InventoryMovement[]
  metadata: Metadata
  setInventoryMovement: (inventoryMovement: InventoryMovement) => void
  setInventoryMovementList: (
    payload: ReturnPayload<InventoryMovement>
  ) => void
}

export const useInventoryMovementStore = create<UseInventoryMovementStore>(
  (set) => ({
    inventoryMovement: <InventoryMovement>{},
    inventoryMovementList: [],
    metadata: {
      currentPage: 1,
      pageSize: 15,
      count: 0,
      totalPages: 0,
      totalRows: 0,
      links: undefined,
    },
    setInventoryMovement: (inventoryMovement) => set({ inventoryMovement }),
    setInventoryMovementList: ({ data, metadata }) =>
      set({ inventoryMovementList: data, metadata: metadata.pagination }),
  })
)
