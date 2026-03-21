import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { putRequest } from '../api'
import { API_PATH_CREATE_UPDATE_SERVICE_VEHICLE_MAINTENANCE } from 'src/constants/routes'
import { ServiceVehicleMaintenance, ServiceVehicleMaintenancePriority, ServiceVehicleMaintenanceStatus, ServiceVehicleMaintenanceType } from './service-vehicle-maintenance.types'

interface UpdateServiceVehicleMaintenancePayload {
  SERVICE_VEHICLE_MAINTENANCE_ID: number
  SERVICE_VEHICLE_ID?: number
  MAINTENANCE_TYPE?: ServiceVehicleMaintenanceType
  PRIORITY?: ServiceVehicleMaintenancePriority
  STATUS?: ServiceVehicleMaintenanceStatus
  TITLE?: string
  DESCRIPTION?: string | null
  SCHEDULED_AT?: string | null
  PERFORMED_AT?: string | null
  ODOMETER?: number | null
  COST_REFERENCE?: number | null
  NOTES?: string | null
  STATE?: 'A' | 'I'
}

export function useUpdateServiceVehicleMaintenanceMutation() {
  return useCustomMutation<
    ServiceVehicleMaintenance,
    UpdateServiceVehicleMaintenancePayload
  >({
    initialData: {} as ServiceVehicleMaintenance,
    mutationKey: ['service-vehicle-maintenance', 'update'],
    mutationFn: async (payload) => {
      const {
        data: { data },
      } = await putRequest<ServiceVehicleMaintenance>(
        API_PATH_CREATE_UPDATE_SERVICE_VEHICLE_MAINTENANCE,
        payload
      )

      return data
    },
  })
}
