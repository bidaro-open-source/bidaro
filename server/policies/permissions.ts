import { permissions } from '~/server/constants'

export function getPermissionsPolicy(event: H3Event) {
  return hasPermission(event, permissions.VIEW_ALL_PERMISSIONS)
}
