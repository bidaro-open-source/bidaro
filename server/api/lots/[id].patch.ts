import { updateLotRequest } from '~~/server/requests/lots/lot.request'
import { createLotResource } from '~~/server/resources/lot.resource'
import { calculateInterval } from '~~/server/services/lot-service'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const user = getAuthenticatedUser(event)

  const request = await updateLotRequest(event)

  const db = useDatabase()

  const lot = await db.Lot.findByPk(request.params.id)

  if (!lot) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Лот не знайдено',
    })
  }

  if (lot.userId !== user.id) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Вам не дозволено оновлювати цей лот',
    })
  }

  if (lot.statusName !== 'draft' && lot.statusName !== 'in_trading_process') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Цей лот не може бути оновлений, оскільки він вже завершенний',
    })
  }

  if (request.body.title) {
    lot.title = request.body.title
  }

  if (request.body.description) {
    lot.description = request.body.description
  }

  if (request.body.duration && lot.statusName === 'draft') {
    lot.duration = calculateInterval(request.body.duration)
  }

  if (request.body.immediatelyPublish && lot.statusName === 'draft') {
    lot.startDate = new Date()
    lot.endDate = new Date(new Date().getTime() + lot.duration)
    lot.statusName = 'in_trading_process'
  }

  await lot.save()

  return createLotResource(lot)
})
