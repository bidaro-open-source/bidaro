import { permissions } from '~~/server/constants'

export const updateUserEmailPolicy = createRequestPolicy((event: H3Event, userId: number) => {
  const user = getAuthenticatedUser(event)
  const userPermissions = getAuthenticatedUserPermissions(event)

  if (!userPermissions)
    return false

  if (user.id.toString() === userId.toString()) {
    return hasPermission(userPermissions, permissions.UPDATE_OWN_EMAIL)
  }

  return false
})
