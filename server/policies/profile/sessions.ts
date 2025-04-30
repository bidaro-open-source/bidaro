import { permissions } from '~/server/constants'

export function getSessionsPolicy(event: H3Event) {
  const userPermissions = getAuthenticatedUserPermissions(event)
  if (!userPermissions)
    return false
  return hasPermission(userPermissions, permissions.VIEW_OWN_SESSIONS)
}

export function deleteSessionsPolicy(event: H3Event) {
  const userPermissions = getAuthenticatedUserPermissions(event)
  if (!userPermissions)
    return false
  return hasPermission(userPermissions, permissions.DELETE_OWN_SESSIONS)
}
