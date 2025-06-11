import { lotRepository } from '~~/server/repositories/lot.repository'
import { userRepository } from '~~/server/repositories/user.repository'
import { lotRequest } from '~~/server/requests/lots/lots.request'
import { createLotResource } from '~~/server/resources/lot.resource'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const user = getAuthenticatedUser(event)

  const request = await lotRequest(event)

  const lot = await userRepository.findLotById(user.id, request.params.id)

  if (!lot) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Лот не знайдено',
    })
  }

  if (lot.statusName !== 'in_discussion_process') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Лот не в процесі обговорення',
    })
  }

  lot.statusName = 'in_delivery_process'

  await lotRepository.save(lot)

  return createLotResource(lot)
})
