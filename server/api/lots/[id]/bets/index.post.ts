import { lotBetService } from '~~/server/modules/lots'
import { createLotBetRequest } from './index.post.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

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
