import { getLotRequest } from '~~/server/requests/lots/lot.request'
import { createLotResource } from '~~/server/resources/lot.resource'
import { createLotBet } from '~~/server/services/lot-bet-service'
import { getUserLot, updateLotStatusToPublished } from '~~/server/services/lot-service'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const user = getAuthenticatedUser(event)

  const request = await getLotRequest(event)

  const lot = await getUserLot(request.params.id, user.id)

  updateLotStatusToPublished(lot)

  await createLotBet(lot.id, user.id, lot.initialAmount)

  await lot.save()

  return createLotResource(lot)
})
