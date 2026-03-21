import { create } from 'zustand'
import { Metadata, ReturnPayload } from 'src/types/general'
import { ServiceVehicle } from 'src/services/service-vehicles/service-vehicle.types'

interface UseServiceVehicleStore {
  serviceVehicleList: ServiceVehicle[]
  metadata: Metadata
  setServiceVehicleList: (payload: ReturnPayload<ServiceVehicle>) => void
}

export const useServiceVehicleStore = create<UseServiceVehicleStore>((set) => ({
  serviceVehicleList: [],
  metadata: {
    currentPage: 1,
    pageSize: 15,
    count: 0,
    totalPages: 0,
    totalRows: 0,
    links: undefined,
  },
  setServiceVehicleList: ({ data, metadata }) =>
    set({ serviceVehicleList: data, metadata: metadata.pagination }),
}))
