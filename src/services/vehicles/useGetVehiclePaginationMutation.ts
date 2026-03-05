import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { GetPayload, ReturnPayload } from 'src/types/general'
import { Vehicle } from './vehicle.types'
import { getQueryString, postRequest } from '../api'
import { API_PATH_GET_VEHICLE_PAGINATION } from 'src/constants/routes'
import { useVehicleStore } from 'src/store/vehicle.store'

const initialData: ReturnPayload<Vehicle> = {
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

export function useGetVehiclePaginationMutation() {
  const { setVehicleList } = useVehicleStore()

  return useCustomMutation<ReturnPayload<Vehicle>, GetPayload<Vehicle>>({
    initialData,
    mutationKey: ['vehicles', 'pagination'],
    onSuccess: setVehicleList,
    onError: () => setVehicleList(initialData),
    mutationFn: async ({ condition, page, size }) => {
      const { data } = await postRequest<Vehicle[]>(
        getQueryString(API_PATH_GET_VEHICLE_PAGINATION, { page, size }),
        condition
      )

      return data || initialData
    },
  })
}
