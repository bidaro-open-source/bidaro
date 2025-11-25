import { lotImageRepository } from '~~/server/repositories/lot-image.repository'
import { createImageResource } from '~~/server/resources/lot-image.resource'
import { lotSource } from '~~/server/sources/lot.source'
import { getLotRequest } from '../index.request'

export default defineEventHandler(async (event) => {
  const request = await getLotRequest(event)

  const lot = await lotSource.getById(request.params.id)

  const images = await lotImageRepository.findAllByLotId(lot.id)

  return images.map(createImageResource)
})
