import { create } from 'zustand'
import { Metadata, ReturnPayload } from 'src/types/general'
import { WorkOrderServiceType } from 'src/services/work-order-service-types/work-order-service-type.types'

interface UseWorkOrderServiceTypeStore {
  workOrderServiceTypeList: WorkOrderServiceType[]
  metadata: Metadata
  setWorkOrderServiceTypeList: (
    payload: ReturnPayload<WorkOrderServiceType>
  ) => void
}

export const useWorkOrderServiceTypeStore = create<UseWorkOrderServiceTypeStore>(
  (set) => ({
    workOrderServiceTypeList: [],
    metadata: {
      currentPage: 1,
      pageSize: 15,
      count: 0,
      totalPages: 0,
      totalRows: 0,
      links: undefined,
    },
    setWorkOrderServiceTypeList: ({ data, metadata }) =>
      set({ workOrderServiceTypeList: data, metadata: metadata.pagination }),
  })
)
