import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { putRequest } from '../api'
import { API_PATH_CREATE_UPDATE_WORK_ORDER_STATUS } from 'src/constants/routes'
import {
  UpdateWorkOrderStatusCatalogPayload,
  WorkOrderStatusCatalog,
} from './work-order-status.types'

export function useUpdateWorkOrderStatusMutation() {
  return useCustomMutation<
    WorkOrderStatusCatalog,
    UpdateWorkOrderStatusCatalogPayload
  >({
    initialData: <WorkOrderStatusCatalog>{},
    mutationKey: ['work-order-statuses', 'update'],
    mutationFn: async (payload) => {
      const {
        data: { data },
      } = await putRequest<WorkOrderStatusCatalog>(
        API_PATH_CREATE_UPDATE_WORK_ORDER_STATUS,
        payload
      )

      return data
    },
  })
}
