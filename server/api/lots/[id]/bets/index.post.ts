import { lotBetService } from '#domains/auction'
import { createLotBetPolicy } from './index.post.policy'
import { createLotBetRequest } from './index.post.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  await useRateLimiter(event, {
    authenticatedLimit: 10,
    anonymousLimit: 0,
    duration: 60,
  })

  createLotBetPolicy(event)

  const user = getAuthenticatedUser(event)

  const request = await createLotBetRequest(event)

  const lotBet = await lotBetService.create(
    request.params.id,
    user.id,
    request.body.amount,
  )

  return {
    id: lotBet.id,
    lotId: lotBet.lotId,
    userId: lotBet.userId,
    amount: lotBet.amount,
    createdAt: lotBet.createdAt,
  }
})
