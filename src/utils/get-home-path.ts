import { PATH_DASHBOARD, PATH_OPERATORS } from 'src/constants/routes'
import { buildActivityPath } from './activity-path'

const roleHomeMap: Record<string, string> = {
  '3': PATH_OPERATORS,
}

const roleHomeActivityIdMap: Record<string, string> = {
  '3': '0-1',
}

const defaultActivityId = '0-1'

export function getHomePathByRole(roleId?: string | number): string {
  const normalizedRoleId =
    roleId === undefined || roleId === null ? '' : String(roleId)

  const basePath = roleHomeMap[normalizedRoleId] ?? PATH_DASHBOARD
  const activityId =
    roleHomeActivityIdMap[normalizedRoleId] ?? defaultActivityId

  if (roleId === undefined || roleId === null) {
    return buildActivityPath(defaultActivityId, PATH_DASHBOARD)
  }

  return buildActivityPath(activityId, basePath)
}
