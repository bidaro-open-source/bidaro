import { createImageResource } from '~~/server/resources/lot-image.resource'
import { imageService } from '~~/server/services/image.service'
import { lotImageService } from '~~/server/services/lot-image.service'
import { lotService } from '~~/server/services/lot.service'
import { uploadLotImagePolicy } from './index.post.policy'
import { uploadLotImageRequest } from './index.post.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await uploadLotImageRequest(event)

  const lot = await lotService.findByIdOrFail(request.params.id)

  uploadLotImagePolicy(event, lot)

  const image = await imageService.upload(request.multipart)

  await lotImageService.attachImages(request.params.id, [image])

  return createImageResource(image)
})
