import { lotRepository } from '~~/server/repositories/lot.repository'
import { createLotResource } from '~~/server/resources/lot.resource'
import { getLotRequest } from './index.request'

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

  return createLotResource(lot)
})
