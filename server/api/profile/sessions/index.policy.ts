import { permissions } from '~~/server/constants'

export const getSessionsPolicy = createRequestPolicy((event: H3Event) => {
  const userPermissions = getAuthenticatedUserPermissions(event)
  if (!userPermissions)
    return false
  return hasPermission(userPermissions, permissions.VIEW_OWN_SESSIONS)
})

export const deleteSessionsPolicy = createRequestPolicy((event: H3Event) => {
  const userPermissions = getAuthenticatedUserPermissions(event)
  if (!userPermissions)
    return false
  return hasPermission(userPermissions, permissions.DELETE_OWN_SESSIONS)
})
