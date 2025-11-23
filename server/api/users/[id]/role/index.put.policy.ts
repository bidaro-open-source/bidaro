import { permissions } from '~~/server/constants'

export const updateUserRolePolicy = createRequestPolicy((event: H3Event) => {
  const userPermissions = getAuthenticatedUserPermissions(event)
  if (!userPermissions)
    return false
  return hasPermission(userPermissions, permissions.UPDATE_USER_ROLE)
})
