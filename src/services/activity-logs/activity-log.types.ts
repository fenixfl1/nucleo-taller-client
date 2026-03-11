export interface ActivityLogEntry {
  ID: number
  STAFF_ID: number
  ACTION: 'INSERT' | 'UPDATE' | 'DELETE' | string
  MODEL: string
  OBJECT_ID: number | null
  CHANGES: Record<string, unknown> | null
  CREATED_AT: string | null
  IP: string
  USER_AGENT: string
  USERNAME: string
  STAFF_NAME: string
}
