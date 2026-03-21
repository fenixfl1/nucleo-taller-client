import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { putRequest } from '../api'
import { API_PATH_CREATE_UPDATE_SERVICE_VEHICLE } from 'src/constants/routes'
import { ServiceVehicle } from './service-vehicle.types'

interface UpdateServiceVehiclePayload {
  SERVICE_VEHICLE_ID: number
  NAME?: string
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

export function useUpdateServiceVehicleMutation() {
  return useCustomMutation<ServiceVehicle, UpdateServiceVehiclePayload>({
    initialData: <ServiceVehicle>{},
    mutationKey: ['service-vehicles', 'update'],
    mutationFn: async (payload) => {
      const {
        data: { data },
      } = await putRequest<ServiceVehicle>(
        API_PATH_CREATE_UPDATE_SERVICE_VEHICLE,
        payload
      )

      return data
    },
  })
}
