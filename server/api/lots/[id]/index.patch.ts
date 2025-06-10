import { updateLotRequest } from '~~/server/requests/lots/lot.request'
import { createLotResource } from '~~/server/resources/lot.resource'
import { createLotBet } from '~~/server/services/lot-bet-service'
import { getUserLot, updateLotData, updateLotDuration, updateLotStatusToPublished } from '~~/server/services/lot-service'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const user = getAuthenticatedUser(event)

  const request = await updateLotRequest(event)

  const lot = await getUserLot(request.params.id, user.id)

  if (lot.statusName !== 'draft' && lot.statusName !== 'in_trading_process') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Цей лот не може бути оновлений, оскільки він вже завершенний',
    })
  }

  updateLotData(lot, {
    title: request.body.title,
    description: request.body.description,
  })

  updateLotDuration(lot, request.body.duration)

  if (request.body.immediatelyPublish) {
    updateLotStatusToPublished(lot)

    await createLotBet(lot.id, user.id, lot.initialAmount)
  }

  await lot.save()

  return createLotResource(lot)
})
