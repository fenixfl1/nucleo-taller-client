import { PATH_DASHBOARD } from 'src/constants/routes'
import { buildActivityPath } from './activity-path'

const defaultActivityId = '0-1-1'

export function getHomePathByRole(roleId?: string | number): string {
  if (roleId === undefined || roleId === null) {
    return buildActivityPath(defaultActivityId, PATH_DASHBOARD)
  }

  return buildActivityPath(defaultActivityId, PATH_DASHBOARD)
}
