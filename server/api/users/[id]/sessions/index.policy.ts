import { permissions } from '~~/server/constants'

export const getSessionsPolicy = createRequestPolicy((event: H3Event, userId: number) => {
  const user = getAuthenticatedUser(event)
  const userPermissions = getAuthenticatedUserPermissions(event)
  if (!userPermissions)
    return false

  if (user.id.toString() === userId.toString()) {
    return hasPermission(userPermissions, permissions.VIEW_OWN_SESSIONS)
  }

  return false
})

export const deleteSessionsPolicy = createRequestPolicy((event: H3Event, userId: number) => {
  const user = getAuthenticatedUser(event)
  const userPermissions = getAuthenticatedUserPermissions(event)

  if (!userPermissions)
    return false

  if (user.id.toString() === userId.toString()) {
    return hasPermission(userPermissions, permissions.DELETE_OWN_SESSIONS)
  }

  return false
})
