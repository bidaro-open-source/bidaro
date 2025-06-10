import { createLotRequest } from '~~/server/requests/lots/lot.request'
import { createLotResource } from '~~/server/resources/lot.resource'
import { calculateLotDuration, updateLotStatusToPublished } from '~~/server/services/lot-service'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const user = getAuthenticatedUser(event)

  const request = await createLotRequest(event)

  const db = useDatabase()

  const newLot = db.Lot.build({
    userId: user.id,
    title: request.body.title,
    description: request.body.description,
    duration: calculateLotDuration(request.body.duration),
    statusName: 'draft',
  })

  if (request.body.immediatelyPublish) {
    updateLotStatusToPublished(newLot)
  }

  await newLot.save()

  return createLotResource(newLot)
})
