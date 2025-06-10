import { getLotRequest } from '~~/server/requests/lots/lot.request'
import { createLotResource } from '~~/server/resources/lot.resource'
import { getLot } from '~~/server/services/lot-service'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const user = getAuthenticatedUser(event)

  const request = await getLotRequest(event)

  const lot = await getLot(request.params.id, { withUser: true })

  if (lot.statusName === 'draft' && lot.userId !== user.id) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Лот не знайдено',
    })
  }

  return createLotResource(lot)
})
