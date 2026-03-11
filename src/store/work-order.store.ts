import { create } from 'zustand'
import { Metadata, ReturnPayload } from 'src/types/general'
import { WorkOrder } from 'src/services/work-orders/work-order.types'

interface UseWorkOrderStore {
  workOrder: WorkOrder
  workOrderList: WorkOrder[]
  metadata: Metadata
  setWorkOrder: (workOrder: WorkOrder) => void
  setWorkOrderList: (payload: ReturnPayload<WorkOrder>) => void
}

export const useWorkOrderStore = create<UseWorkOrderStore>((set) => ({
  workOrder: <WorkOrder>{},
  workOrderList: [],
  metadata: {
    currentPage: 1,
    pageSize: 15,
    count: 0,
    totalPages: 0,
    totalRows: 0,
    links: undefined,
  },
  setWorkOrder: (workOrder) => set({ workOrder }),
  setWorkOrderList: ({ data, metadata }) =>
    set({ workOrderList: data, metadata: metadata.pagination }),
}))
