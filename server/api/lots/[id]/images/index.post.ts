import { lotImageService, lotSource } from '#domains/auction'
import { imageResource, imageService } from '#domains/storage'
import { createAppError } from '#utils/create-app-error'
import { IMAGE_PER_LOT_LIMIT } from '~~/server/constants'
import { uploadLotImagePolicy } from './index.post.policy'
import { uploadLotImageRequest } from './index.post.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  await useRateLimiter(event, {
    authenticatedLimit: 20,
    anonymousLimit: 0,
    duration: 60,
  })

  const request = await uploadLotImageRequest(event)

  const lot = await lotSource.getById(request.params.id)

  uploadLotImagePolicy(event, lot)

  const images = await lotSource.getAllImagesById(request.params.id)

  if (images.length >= IMAGE_PER_LOT_LIMIT) {
    throw createAppError('LOT_IMAGE_LIMIT_REACHED')
  }

  const image = await imageService.upload(request.multipart.buffer)

  await lotImageService.attachImages(request.params.id, [image])

  return imageResource.make(image)
})
