import { permissions } from '~~/server/constants'

export const deleteUserPolicy = createRequestPolicy((event: H3Event) => {
  const userPermissions = getAuthenticatedUserPermissions(event)
  if (!userPermissions)
    return false
  return hasPermission(userPermissions, permissions.DELETE_USER)
})
