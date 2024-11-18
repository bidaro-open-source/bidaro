import { permissions } from '~/server/constants'

export function getRolesPolicy(event: H3Event) {
  return hasPermission(event, permissions.VIEW_ALL_ROLES)
}
