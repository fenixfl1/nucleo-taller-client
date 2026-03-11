import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { putRequest } from '../api'
import { API_PATH_CREATE_UPDATE_WORK_ORDER } from 'src/constants/routes'
import { UpdateWorkOrderPayload, WorkOrder } from './work-order.types'

export function useUpdateWorkOrderMutation() {
  return useCustomMutation<WorkOrder, UpdateWorkOrderPayload>({
    initialData: <WorkOrder>{},
    mutationKey: ['work-orders', 'update-work-order'],
    mutationFn: async (payload) => {
      const {
        data: { data },
      } = await putRequest<WorkOrder>(API_PATH_CREATE_UPDATE_WORK_ORDER, payload)

      return data
    },
  })
}
