import { betLotRequest } from '~~/server/requests/lots/lot.request'
import { createLotBetResource } from '~~/server/resources/lot-bet.resource'
import { createLotBet } from '~~/server/services/lot-bet-service'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const user = getAuthenticatedUser(event)

  const request = await betLotRequest(event)

  const bet = await createLotBet(
    request.params.id,
    user.id,
    request.body.amount,
  )

  return createLotBetResource(bet)
})
