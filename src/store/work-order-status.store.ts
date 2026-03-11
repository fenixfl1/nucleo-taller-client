import { create } from 'zustand'
import { Metadata, ReturnPayload } from 'src/types/general'
import { WorkOrderStatusCatalog } from 'src/services/work-order-statuses/work-order-status.types'

interface UseWorkOrderStatusStore {
  workOrderStatusList: WorkOrderStatusCatalog[]
  metadata: Metadata
  setWorkOrderStatusList: (
    payload: ReturnPayload<WorkOrderStatusCatalog>
  ) => void
}

export const useWorkOrderStatusStore = create<UseWorkOrderStatusStore>((set) => ({
  workOrderStatusList: [],
  metadata: {
    currentPage: 1,
    pageSize: 15,
    count: 0,
    totalPages: 0,
    totalRows: 0,
    links: undefined,
  },
  setWorkOrderStatusList: ({ data, metadata }) =>
    set({ workOrderStatusList: data, metadata: metadata.pagination }),
}))
