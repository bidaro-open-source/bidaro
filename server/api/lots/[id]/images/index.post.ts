import { createImageResource, lotImageService, lotSource } from '~~/server/domains/auction'
import { imageService } from '~~/server/domains/storage'
import { uploadLotImagePolicy } from './index.post.policy'
import { uploadLotImageRequest } from './index.post.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await uploadLotImageRequest(event)

  const lot = await lotSource.getById(request.params.id)

  uploadLotImagePolicy(event, lot)

  const image = await imageService.upload(request.multipart)

  await lotImageService.attachImages(request.params.id, [image])

  return createImageResource(image)
})
