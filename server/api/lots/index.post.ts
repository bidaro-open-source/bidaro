import { createLotRequest } from '~~/server/requests/lots/lot.request'
import { createLotResource } from '~~/server/resources/lot.resource'
import { createLotBet } from '~~/server/services/lot-bet-service'
import { calculateLotDuration, updateLotStatusToPublished } from '~~/server/services/lot-service'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const user = getAuthenticatedUser(event)

  const request = await createLotRequest(event)

  const db = useDatabase()

  const newLot = await db.Lot.create({
    userId: user.id,
    title: request.body.title,
    description: request.body.description,
    initialAmount: request.body.initialAmount,
    duration: calculateLotDuration(request.body.duration),
    statusName: 'draft',
  })

  if (request.body.immediatelyPublish) {
    updateLotStatusToPublished(newLot)

    await createLotBet(newLot.id, user.id, newLot.initialAmount)
  }

  await newLot.save()

  return createLotResource(newLot)
})
