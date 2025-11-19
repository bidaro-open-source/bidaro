import type { Lot } from '~~/server/database'

export const shipLotPolicy = createRequestPolicy((event: H3Event, lot: Lot) => {
  const user = getAuthenticatedUser(event)

  return user.id === lot.sellerId
})
