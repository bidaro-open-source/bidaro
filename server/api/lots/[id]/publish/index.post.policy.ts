import type { LotAttributes } from '#database'
import { permissions } from '~~/server/constants'

export const publishLotPolicy = createRequestPolicy((event: H3Event, lot: LotAttributes) => {
  const userPermissions = getAuthenticatedUserPermissions(event)
  if (!userPermissions)
    return false
  if (!hasPermission(userPermissions, permissions.PUBLISH_LOT))
    return false

  const user = getAuthenticatedUser(event)

  return user.id === lot.sellerId
})
