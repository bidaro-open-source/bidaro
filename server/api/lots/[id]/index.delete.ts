import { lotRepository } from '~~/server/repositories/lot.repository'
import { userRepository } from '~~/server/repositories/user.repository'
import { lotRequest } from '~~/server/requests/lots/lots.request'
import { unregisterImage } from '~~/server/services/image-service'

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

  if (lot.statusName !== 'draft') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Цей лот не може бути видалений, оскільки він вже опублікований',
    })
  }

  if (lot.imageId) {
    await unregisterImage(lot.imageId)
  }

  await lotRepository.destroy(lot)

  return { message: 'Лот успішно видалено' }
})
