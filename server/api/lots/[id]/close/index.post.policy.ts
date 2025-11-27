import type { Lot } from '~~/server/database'
import { permissions } from '~~/server/constants'

export const closeLotPolicy = createRequestPolicy((event: H3Event, lot: Lot) => {
  const userPermissions = getAuthenticatedUserPermissions(event)
  if (!userPermissions)
    return false
  if (!hasPermission(userPermissions, permissions.CLOSE_LOT))
    return false

  const user = getAuthenticatedUser(event)

  return user.id === lot.sellerId
})
