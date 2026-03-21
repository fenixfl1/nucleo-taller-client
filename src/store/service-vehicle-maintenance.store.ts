import { create } from 'zustand'
import { Metadata, ReturnPayload } from 'src/types/general'
import { ServiceVehicleMaintenance } from 'src/services/service-vehicle-maintenances/service-vehicle-maintenance.types'

interface UseServiceVehicleMaintenanceStore {
  maintenanceList: ServiceVehicleMaintenance[]
  metadata: Metadata
  setMaintenanceList: (
    payload: ReturnPayload<ServiceVehicleMaintenance>
  ) => void
}

export const useServiceVehicleMaintenanceStore =
  create<UseServiceVehicleMaintenanceStore>((set) => ({
    maintenanceList: [],
    metadata: {
      currentPage: 1,
      pageSize: 15,
      count: 0,
      totalPages: 0,
      totalRows: 0,
      links: undefined,
    },
    setMaintenanceList: ({ data, metadata }) =>
      set({ maintenanceList: data, metadata: metadata.pagination }),
  }))
