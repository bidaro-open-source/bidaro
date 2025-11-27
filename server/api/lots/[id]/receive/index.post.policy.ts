import type { LotAttributes } from '~~/server/database'
import { permissions } from '~~/server/constants'

export const receiveLotPolicy = createRequestPolicy((event: H3Event, lot: LotAttributes) => {
  const userPermissions = getAuthenticatedUserPermissions(event)
  if (!userPermissions)
    return false
  if (!hasPermission(userPermissions, permissions.RECEIVE_LOT))
    return false

  const user = getAuthenticatedUser(event)

  return user.id === lot.winnerId
})
