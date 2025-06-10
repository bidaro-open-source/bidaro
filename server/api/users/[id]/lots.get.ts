import { getUserLotsRequest } from '~~/server/requests/users/user-lots.request'
import { createLotResource } from '~~/server/resources/lot.resource'
import { getPublishedUserLots, getUserLots } from '~~/server/services/lot-service'

export default defineEventHandler(async (event) => {
  const user = getAuthenticatedUser(event)

  const request = await getUserLotsRequest(event)

  const lots = user.id === request.params.id
    ? await getUserLots(request.params.id)
    : await getPublishedUserLots(request.params.id)

  return lots.map(lot => createLotResource(lot))
})
