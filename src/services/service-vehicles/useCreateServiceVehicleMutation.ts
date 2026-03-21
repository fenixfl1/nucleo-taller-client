import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { postRequest } from '../api'
import { API_PATH_CREATE_UPDATE_SERVICE_VEHICLE } from 'src/constants/routes'
import { ServiceVehicle } from './service-vehicle.types'

interface CreateServiceVehiclePayload {
  NAME: string
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

export function useCreateServiceVehicleMutation() {
  return useCustomMutation<ServiceVehicle, CreateServiceVehiclePayload>({
    initialData: <ServiceVehicle>{},
    mutationKey: ['service-vehicles', 'create'],
    mutationFn: async (payload) => {
      const {
        data: { data },
      } = await postRequest<ServiceVehicle>(
        API_PATH_CREATE_UPDATE_SERVICE_VEHICLE,
        payload
      )

      return data
    },
  })
}
