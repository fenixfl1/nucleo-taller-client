import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { postRequest } from '../api'
import { API_PATH_CREATE_UPDATE_VEHICLE } from 'src/constants/routes'
import { Vehicle } from './vehicle.types'

interface CreateVehiclePayload {
  CUSTOMER_ID: number
  PLATE?: string
  VIN?: string
  BRAND: string
  MODEL: string
  YEAR?: number | null
  COLOR?: string
  ENGINE?: string
  NOTES?: string
  STATE?: 'A' | 'I'
}

export function useCreateVehicleMutation() {
  return useCustomMutation<Vehicle, CreateVehiclePayload>({
    initialData: <Vehicle>{},
    mutationKey: ['vehicles', 'create-vehicle'],
    mutationFn: async (payload) => {
      const {
        data: { data },
      } = await postRequest<Vehicle>(API_PATH_CREATE_UPDATE_VEHICLE, payload)

      return data
    },
  })
}
