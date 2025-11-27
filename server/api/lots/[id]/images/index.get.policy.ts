import { permissions } from '~~/server/constants'

export const viewLotImagesPolicy = createRequestPolicy((event: H3Event) => {
  const userPermissions = getAuthenticatedUserPermissions(event)
  if (!userPermissions)
    return false
  return hasPermission(userPermissions, permissions.VIEW_LOT_IMAGES)
})
