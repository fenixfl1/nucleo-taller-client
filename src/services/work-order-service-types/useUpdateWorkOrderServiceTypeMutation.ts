import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { putRequest } from '../api'
import { API_PATH_CREATE_UPDATE_WORK_ORDER_SERVICE_TYPE } from 'src/constants/routes'
import {
  UpdateWorkOrderServiceTypePayload,
  WorkOrderServiceType,
} from './work-order-service-type.types'

export function useUpdateWorkOrderServiceTypeMutation() {
  return useCustomMutation<
    WorkOrderServiceType,
    UpdateWorkOrderServiceTypePayload
  >({
    initialData: <WorkOrderServiceType>{},
    mutationKey: ['work-order-service-types', 'update'],
    mutationFn: async (payload) => {
      const {
        data: { data },
      } = await putRequest<WorkOrderServiceType>(
        API_PATH_CREATE_UPDATE_WORK_ORDER_SERVICE_TYPE,
        payload
      )

      return data
    },
  })
}
