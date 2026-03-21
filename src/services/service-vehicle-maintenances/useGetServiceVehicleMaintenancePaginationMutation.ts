import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { GetPayload, ReturnPayload } from 'src/types/general'
import { getQueryString, postRequest } from '../api'
import { API_PATH_GET_SERVICE_VEHICLE_MAINTENANCE_PAGINATION } from 'src/constants/routes'
import { ServiceVehicleMaintenance } from './service-vehicle-maintenance.types'
import { useServiceVehicleMaintenanceStore } from 'src/store/service-vehicle-maintenance.store'

const initialData: ReturnPayload<ServiceVehicleMaintenance> = {
  data: [],
  metadata: {
    pagination: {
      currentPage: 1,
      totalPages: 0,
      totalRows: 0,
      count: 0,
      pageSize: 15,
      links: undefined,
    },
  },
}

export function useGetServiceVehicleMaintenancePaginationMutation() {
  const { setMaintenanceList } = useServiceVehicleMaintenanceStore()

  return useCustomMutation<
    ReturnPayload<ServiceVehicleMaintenance>,
    GetPayload<ServiceVehicleMaintenance>
  >({
    initialData,
    mutationKey: ['service-vehicle-maintenance', 'pagination'],
    onSuccess: setMaintenanceList,
    onError: () => setMaintenanceList(initialData),
    mutationFn: async ({ condition, page, size }) => {
      const { data } = await postRequest<ServiceVehicleMaintenance[]>(
        getQueryString(API_PATH_GET_SERVICE_VEHICLE_MAINTENANCE_PAGINATION, {
          page,
          size,
        }),
        condition
      )

      return data || initialData
    },
  })
}
