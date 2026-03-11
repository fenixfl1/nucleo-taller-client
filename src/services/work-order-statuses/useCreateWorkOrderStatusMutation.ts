import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { postRequest } from '../api'
import { API_PATH_CREATE_UPDATE_WORK_ORDER_STATUS } from 'src/constants/routes'
import {
  WorkOrderStatusCatalog,
  WorkOrderStatusCatalogPayload,
} from './work-order-status.types'

export function useCreateWorkOrderStatusMutation() {
  return useCustomMutation<WorkOrderStatusCatalog, WorkOrderStatusCatalogPayload>({
    initialData: <WorkOrderStatusCatalog>{},
    mutationKey: ['work-order-statuses', 'create'],
    mutationFn: async (payload) => {
      const {
        data: { data },
      } = await postRequest<WorkOrderStatusCatalog>(
        API_PATH_CREATE_UPDATE_WORK_ORDER_STATUS,
        payload
      )

      return data
    },
  })
}
