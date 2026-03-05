import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { putRequest } from '../api'
import { API_PATH_CREATE_UPDATE_VEHICLE } from 'src/constants/routes'
import { Vehicle } from './vehicle.types'

interface UpdateVehiclePayload {
  VEHICLE_ID: number
  CUSTOMER_ID?: number
  PLATE?: string
  VIN?: string
  BRAND?: string
  MODEL?: string
  YEAR?: number | null
  COLOR?: string
  ENGINE?: string
  NOTES?: string
  STATE?: 'A' | 'I'
}

export function useUpdateVehicleMutation() {
  return useCustomMutation<Vehicle, UpdateVehiclePayload>({
    initialData: <Vehicle>{},
    mutationKey: ['vehicles', 'update-vehicle'],
    mutationFn: async (payload) => {
      const {
        data: { data },
      } = await putRequest<Vehicle>(API_PATH_CREATE_UPDATE_VEHICLE, payload)

      return data
    },
  })
}
