import { lotRepository } from '~~/server/repositories/lot.repository'
import { createImageResource } from '~~/server/resources/lot-image.resource'
import { imageService } from '~~/server/services/image.service'
import { lotService } from '~~/server/services/lot.service'
import { uploadLotImagePolicy } from './index.post.policy'
import { uploadLotImageRequest } from './index.post.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await uploadLotImageRequest(event)

  const lot = await lotRepository.findByIdOrFail(request.params.id)

  uploadLotImagePolicy(event, lot)

  const image = await imageService.upload(request.multipart)

  await lotService.attachImages(request.params.id, [image])

  return createImageResource(image)
})
