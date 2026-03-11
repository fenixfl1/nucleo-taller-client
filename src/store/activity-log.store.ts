import { create } from 'zustand'
import { Metadata, ReturnPayload } from 'src/types/general'
import { ActivityLogEntry } from 'src/services/activity-logs/activity-log.types'

interface UseActivityLogStore {
  activityLog: ActivityLogEntry
  activityLogList: ActivityLogEntry[]
  metadata: Metadata
  setActivityLog: (activityLog: ActivityLogEntry) => void
  setActivityLogList: (payload: ReturnPayload<ActivityLogEntry>) => void
}

export const useActivityLogStore = create<UseActivityLogStore>((set) => ({
  activityLog: {} as ActivityLogEntry,
  activityLogList: [],
  metadata: {
    currentPage: 1,
    pageSize: 15,
    count: 0,
    totalPages: 0,
    totalRows: 0,
    links: undefined,
  },
  setActivityLog: (activityLog) => set({ activityLog }),
  setActivityLogList: ({ data, metadata }) =>
    set({ activityLogList: data, metadata: metadata.pagination }),
}))
