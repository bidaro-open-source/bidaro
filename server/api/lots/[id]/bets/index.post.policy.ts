import { permissions } from '~~/server/constants'

export const createLotBetPolicy = createRequestPolicy((event: H3Event) => {
  const userPermissions = getAuthenticatedUserPermissions(event)
  if (!userPermissions)
    return false
  return hasPermission(userPermissions, permissions.CREATE_LOT_BET)
})
