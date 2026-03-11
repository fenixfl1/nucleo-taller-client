import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { postRequest } from '../api'
import { API_PATH_CREATE_UPDATE_WORK_ORDER } from 'src/constants/routes'
import { WorkOrder, WorkOrderPayload } from './work-order.types'

export function useCreateWorkOrderMutation() {
  return useCustomMutation<WorkOrder, WorkOrderPayload>({
    initialData: <WorkOrder>{},
    mutationKey: ['work-orders', 'create-work-order'],
    mutationFn: async (payload) => {
      const {
        data: { data },
      } = await postRequest<WorkOrder>(API_PATH_CREATE_UPDATE_WORK_ORDER, payload)

      return data
    },
  })
}
