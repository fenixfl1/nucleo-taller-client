import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { GetPayload, ReturnPayload } from 'src/types/general'
import { getQueryString, postRequest } from '../api'
import { API_PATH_GET_SERVICE_VEHICLE_USAGE_PAGINATION } from 'src/constants/routes'
import { ServiceVehicleUsage } from './service-vehicle-usage.types'
import { useServiceVehicleUsageStore } from 'src/store/service-vehicle-usage.store'

const initialData: ReturnPayload<ServiceVehicleUsage> = {
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

export function useGetServiceVehicleUsagePaginationMutation() {
  const { setUsageList } = useServiceVehicleUsageStore()

  return useCustomMutation<ReturnPayload<ServiceVehicleUsage>, GetPayload<ServiceVehicleUsage>>({
    initialData,
    mutationKey: ['service-vehicle-usage', 'pagination'],
    onSuccess: setUsageList,
    onError: () => setUsageList(initialData),
    mutationFn: async ({ condition, page, size }) => {
      const { data } = await postRequest<ServiceVehicleUsage[]>(
        getQueryString(API_PATH_GET_SERVICE_VEHICLE_USAGE_PAGINATION, {
          page,
          size,
        }),
        condition
      )

      return data || initialData
    },
  })
}
