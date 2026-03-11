import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { postRequest } from '../api'
import { API_PATH_CREATE_UPDATE_WORK_ORDER_SERVICE_TYPE } from 'src/constants/routes'
import {
  WorkOrderServiceType,
  WorkOrderServiceTypePayload,
} from './work-order-service-type.types'

export function useCreateWorkOrderServiceTypeMutation() {
  return useCustomMutation<WorkOrderServiceType, WorkOrderServiceTypePayload>({
    initialData: <WorkOrderServiceType>{},
    mutationKey: ['work-order-service-types', 'create'],
    mutationFn: async (payload) => {
      const {
        data: { data },
      } = await postRequest<WorkOrderServiceType>(
        API_PATH_CREATE_UPDATE_WORK_ORDER_SERVICE_TYPE,
        payload
      )

      return data
    },
  })
}
