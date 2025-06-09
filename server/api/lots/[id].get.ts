import { getLotRequest } from '~~/server/requests/lots/lot.request'
import { createLotResource } from '~~/server/resources/lot.resource'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const user = getAuthenticatedUser(event)

  const request = await getLotRequest(event)

  const db = useDatabase()

  const lot = await db.Lot.findByPk(request.params.id)

  if (!lot) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Лот не знайдено',
    })
  }

  if (lot.userId !== user.id && lot.statusName === 'draft') {
    throw createError({
      statusCode: 404,
      statusMessage: 'Лот не знайдено',
    })
  }

  return createLotResource(lot)
})
