import { create } from 'zustand'
import { Metadata, ReturnPayload } from 'src/types/general'
import { ServiceVehicleUsage } from 'src/services/service-vehicle-usages/service-vehicle-usage.types'

interface UseServiceVehicleUsageStore {
  usageList: ServiceVehicleUsage[]
  metadata: Metadata
  setUsageList: (payload: ReturnPayload<ServiceVehicleUsage>) => void
}

export const useServiceVehicleUsageStore =
  create<UseServiceVehicleUsageStore>((set) => ({
    usageList: [],
    metadata: {
      currentPage: 1,
      pageSize: 15,
      count: 0,
      totalPages: 0,
      totalRows: 0,
      links: undefined,
    },
    setUsageList: ({ data, metadata }) =>
      set({ usageList: data, metadata: metadata.pagination }),
  }))
