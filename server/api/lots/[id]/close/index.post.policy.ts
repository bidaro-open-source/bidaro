import type { Lot } from '~~/server/database'

export const closeLotPolicy = createRequestPolicy((event: H3Event, lot: Lot) => {
  const user = getAuthenticatedUser(event)

  return user.id === lot.sellerId
})
