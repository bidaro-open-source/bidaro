import { permissions } from '~~/server/constants'

export const verifyUserPolicy = createRequestPolicy((event: H3Event) => {
  const userPermissions = getAuthenticatedUserPermissions(event)
  if (!userPermissions)
    return false
  return hasPermission(userPermissions, permissions.VERIFY_USER)
})
