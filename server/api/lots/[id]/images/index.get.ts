import { lotImageRepository } from '~~/server/repositories/lot-image.repository'
import { createImageResource } from '~~/server/resources/lot-image.resource'
import { lotService } from '~~/server/services/lot.service'
import { getLotRequest } from '../index.request'

export default defineEventHandler(async (event) => {
  const request = await getLotRequest(event)

  await lotService.findByIdOrFail(request.params.id)

  const images = await lotImageRepository.findAllByLotId(request.params.id)

  return images.map(createImageResource)
})
