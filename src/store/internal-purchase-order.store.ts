import { create } from 'zustand'
import { Metadata, ReturnPayload } from 'src/types/general'
import { InternalPurchaseOrder } from 'src/services/internal-purchase-orders/internal-purchase-order.types'

interface UseInternalPurchaseOrderStore {
  internalPurchaseOrder: InternalPurchaseOrder
  internalPurchaseOrderList: InternalPurchaseOrder[]
  metadata: Metadata
  setInternalPurchaseOrder: (
    internalPurchaseOrder: InternalPurchaseOrder
  ) => void
  setInternalPurchaseOrderList: (
    payload: ReturnPayload<InternalPurchaseOrder>
  ) => void
}

export const useInternalPurchaseOrderStore =
  create<UseInternalPurchaseOrderStore>((set) => ({
    internalPurchaseOrder: {} as InternalPurchaseOrder,
    internalPurchaseOrderList: [],
    metadata: {
      currentPage: 1,
      pageSize: 15,
      count: 0,
      totalPages: 0,
      totalRows: 0,
      links: undefined,
    },
    setInternalPurchaseOrder: (internalPurchaseOrder) =>
      set({ internalPurchaseOrder }),
    setInternalPurchaseOrderList: ({ data, metadata }) =>
      set({
        internalPurchaseOrderList: data,
        metadata: metadata.pagination,
      }),
  }))
