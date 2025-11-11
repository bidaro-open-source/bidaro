import { lotImageRepository } from '~~/server/repositories/lot-image.repository'
import { lotRepository } from '~~/server/repositories/lot.repository'
import { getLotRequest } from '../index.request'

export default defineEventHandler(async (event) => {
  const request = await getLotRequest(event)

  await lotRepository.findByIdOrFail(request.params.id)

  const images = await lotImageRepository.findAllByLot(request.params.id)

  return images.map(image => ({
    id: image.id,
    key: image.key,
    bucket: image.bucket,
    mime: image.mime_type,
  }))
})
