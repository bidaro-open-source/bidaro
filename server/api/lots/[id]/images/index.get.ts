import { lotImageRepository } from '~~/server/repositories/lot-image.repository'
import { lotRepository } from '~~/server/repositories/lot.repository'
import { createImageResource } from '~~/server/resources/lot-image.resource'
import { getLotRequest } from '../index.request'

export default defineEventHandler(async (event) => {
  const request = await getLotRequest(event)

  await lotRepository.findByIdOrFail(request.params.id)

  const images = await lotImageRepository.findAllByLotId(request.params.id)

  return images.map(createImageResource)
})
