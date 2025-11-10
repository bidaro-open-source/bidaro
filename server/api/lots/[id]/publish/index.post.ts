import { lotStatuses } from '~~/server/constants'
import { lotRepository } from '~~/server/repositories/lot.repository'
import { createLotResource } from '~~/server/resources/lot.resource'
import { getLotRequest } from '../index.request'

export default defineEventHandler(async (event) => {
  const request = await getLotRequest(event)

  const lot = await lotRepository.findById(request.params.id)

  if (!lot) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Лот не знайдено',
    })
  }

  if (lot.statusName !== lotStatuses.DRAFT) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Лот вже опубліковано',
    })
  }

  try {
    lot.statusName = lotStatuses.IN_TRADING_PROCESS

    await lot.save()

    return createLotResource(lot)
  }
  catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Unprocessable Content',
      message: 'Невідома помилка під час публікації лота',
      data: error,
    })
  }
})
