import { lotRepository } from '~~/server/repositories/lot.repository'
import { userRepository } from '~~/server/repositories/user.repository'
import { updateLotRequest } from '~~/server/requests/lots/lots.patch.request'
import { createLotResource } from '~~/server/resources/lot.resource'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const user = getAuthenticatedUser(event)

  const request = await updateLotRequest(event)

  const lot = await userRepository.findLotById(user.id, request.params.id)

  if (!lot) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Лот не знайдено',
    })
  }

  if (lot.statusName !== 'draft' && lot.statusName !== 'in_trading_process') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Цей лот не може бути оновлений, оскільки він вже завершенний',
    })
  }

  lot.title = request.body.title ?? lot.title
  lot.description = request.body.description ?? lot.description

  if (lot.statusName === 'draft') {
    lot.initialAmount = request.body.initialAmount ?? lot.initialAmount
    lot.initialDuration = request.body.initialDuration ?? lot.initialDuration
  }

  await lotRepository.save(lot)

  return createLotResource(lot)
})
