import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { postRequest } from '../api'
import { API_PATH_CREATE_UPDATE_SERVICE_VEHICLE_MAINTENANCE } from 'src/constants/routes'
import { ServiceVehicleMaintenance, ServiceVehicleMaintenancePriority, ServiceVehicleMaintenanceStatus, ServiceVehicleMaintenanceType } from './service-vehicle-maintenance.types'

interface CreateServiceVehicleMaintenancePayload {
  SERVICE_VEHICLE_ID: number
  MAINTENANCE_TYPE?: ServiceVehicleMaintenanceType
  PRIORITY?: ServiceVehicleMaintenancePriority
  STATUS?: ServiceVehicleMaintenanceStatus
  TITLE: string
  DESCRIPTION?: string | null
  SCHEDULED_AT?: string | null
  PERFORMED_AT?: string | null
  ODOMETER?: number | null
  COST_REFERENCE?: number | null
  NOTES?: string | null
  STATE?: 'A' | 'I'
}

export function useCreateServiceVehicleMaintenanceMutation() {
  return useCustomMutation<
    ServiceVehicleMaintenance,
    CreateServiceVehicleMaintenancePayload
  >({
    initialData: {} as ServiceVehicleMaintenance,
    mutationKey: ['service-vehicle-maintenance', 'create'],
    mutationFn: async (payload) => {
      const {
        data: { data },
      } = await postRequest<ServiceVehicleMaintenance>(
        API_PATH_CREATE_UPDATE_SERVICE_VEHICLE_MAINTENANCE,
        payload
      )

      return data
    },
  })
}
