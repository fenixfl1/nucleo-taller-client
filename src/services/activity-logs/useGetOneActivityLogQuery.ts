import { useQuery } from '@tanstack/react-query'
import { getRequest } from '../api'
import { API_PATH_GET_ONE_ACTIVITY_LOG } from 'src/constants/routes'
import { useActivityLogStore } from 'src/store/activity-log.store'
import { ActivityLogEntry } from './activity-log.types'

export function useGetOneActivityLogQuery(
  activityLogId?: number,
  enabled = true
) {
  const { setActivityLog } = useActivityLogStore()

  return useQuery<ActivityLogEntry>({
    enabled: enabled && Boolean(activityLogId),
    queryKey: ['activity-log', 'one', activityLogId],
    queryFn: async () => {
      const {
        data: { data },
      } = await getRequest<ActivityLogEntry>(`${API_PATH_GET_ONE_ACTIVITY_LOG}${activityLogId}`)

      setActivityLog(data)
      return data
    },
  })
}
