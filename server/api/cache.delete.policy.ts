import { permissions } from '~~/server/constants'

export const clearCachePolicy = createRequestPolicy((event: H3Event) => {
  const userPermissions = getAuthenticatedUserPermissions(event)
  if (!userPermissions)
    return false
  return hasPermission(userPermissions, permissions.CLEAR_CACHE)
})
