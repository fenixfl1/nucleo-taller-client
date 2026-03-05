import { create } from 'zustand'
import { Metadata, ReturnPayload } from 'src/types/general'
import { Vehicle } from 'src/services/vehicles/vehicle.types'

interface UseVehicleStore {
  vehicleList: Vehicle[]
  metadata: Metadata
  setVehicleList: (payload: ReturnPayload<Vehicle>) => void
}

export const useVehicleStore = create<UseVehicleStore>((set) => ({
  vehicleList: [],
  metadata: {
    currentPage: 1,
    pageSize: 15,
    count: 0,
    totalPages: 0,
    totalRows: 0,
    links: undefined,
  },
  setVehicleList: ({ data, metadata }) =>
    set({ vehicleList: data, metadata: metadata.pagination }),
}))
