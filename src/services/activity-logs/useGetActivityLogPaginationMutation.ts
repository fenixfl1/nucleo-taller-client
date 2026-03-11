import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { GetPayload, ReturnPayload } from 'src/types/general'
import { ActivityLogEntry } from './activity-log.types'
import { getQueryString, postRequest } from '../api'
import { API_PATH_GET_ACTIVITY_LOG_PAGINATION } from 'src/constants/routes'
import { useActivityLogStore } from 'src/store/activity-log.store'

const initialData: ReturnPayload<ActivityLogEntry> = {
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

export function useGetActivityLogPaginationMutation() {
  const { setActivityLogList } = useActivityLogStore()

  return useCustomMutation<ReturnPayload<ActivityLogEntry>, GetPayload<ActivityLogEntry>>({
    initialData,
    mutationKey: ['activity-log', 'pagination'],
    onSuccess: setActivityLogList,
    onError: () => setActivityLogList(initialData),
    mutationFn: async ({ condition, page, size }) => {
      const { data } = await postRequest<ActivityLogEntry[]>(
        getQueryString(API_PATH_GET_ACTIVITY_LOG_PAGINATION, { page, size }),
        condition
      )

      return data || initialData
    },
  })
}
