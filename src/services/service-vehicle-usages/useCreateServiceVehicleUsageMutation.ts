import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { postRequest } from '../api'
import { API_PATH_CREATE_UPDATE_SERVICE_VEHICLE_USAGE } from 'src/constants/routes'
import { ServiceVehicleUsage, ServiceVehicleUsageStatus } from './service-vehicle-usage.types'

interface CreateServiceVehicleUsagePayload {
  SERVICE_VEHICLE_ID: number
  STAFF_ID?: number | null
  STATUS?: ServiceVehicleUsageStatus
  PURPOSE: string
  ORIGIN?: string | null
  DESTINATION?: string | null
  STARTED_AT: string
  ENDED_AT?: string | null
  ODOMETER_START?: number | null
  ODOMETER_END?: number | null
  NOTES?: string | null
  STATE?: 'A' | 'I'
}

export function useCreateServiceVehicleUsageMutation() {
  return useCustomMutation<ServiceVehicleUsage, CreateServiceVehicleUsagePayload>({
    initialData: {} as ServiceVehicleUsage,
    mutationKey: ['service-vehicle-usage', 'create'],
    mutationFn: async (payload) => {
      const {
        data: { data },
      } = await postRequest<ServiceVehicleUsage>(
        API_PATH_CREATE_UPDATE_SERVICE_VEHICLE_USAGE,
        payload
      )

      return data
    },
  })
}
