import type { LotAttributes } from '#database'
import { permissions } from '~~/server/constants'

export const updateImageOrderPolicy = createRequestPolicy((event: H3Event, lot: LotAttributes) => {
  const userPermissions = getAuthenticatedUserPermissions(event)
  if (!userPermissions)
    return false
  if (!hasPermission(userPermissions, permissions.UPDATE_LOT_IMAGE_ORDER))
    return false

  const user = getAuthenticatedUser(event)

  return user.id === lot.sellerId
})
