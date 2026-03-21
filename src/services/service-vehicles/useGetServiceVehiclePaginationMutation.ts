import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { GetPayload, ReturnPayload } from 'src/types/general'
import { ServiceVehicle } from './service-vehicle.types'
import { getQueryString, postRequest } from '../api'
import { API_PATH_GET_SERVICE_VEHICLE_PAGINATION } from 'src/constants/routes'
import { useServiceVehicleStore } from 'src/store/service-vehicle.store'

const initialData: ReturnPayload<ServiceVehicle> = {
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

export function useGetServiceVehiclePaginationMutation() {
  const { setServiceVehicleList } = useServiceVehicleStore()

  return useCustomMutation<
    ReturnPayload<ServiceVehicle>,
    GetPayload<ServiceVehicle>
  >({
    initialData,
    mutationKey: ['service-vehicles', 'pagination'],
    onSuccess: setServiceVehicleList,
    onError: () => setServiceVehicleList(initialData),
    mutationFn: async ({ condition, page, size }) => {
      const { data } = await postRequest<ServiceVehicle[]>(
        getQueryString(API_PATH_GET_SERVICE_VEHICLE_PAGINATION, {
          page,
          size,
        }),
        condition
      )

      return data || initialData
    },
  })
}
