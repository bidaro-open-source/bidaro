import { lotService, lotSource } from '#domains/auction'
import { imageService } from '~~/server/domains/storage'
import { deleteLotPolicy } from './index.delete.policy'
import { viewLotRequest } from './index.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  await useRateLimiter(event, {
    authenticatedLimit: 10,
    anonymousLimit: 0,
    duration: 60,
  })

  const request = await viewLotRequest(event)

  const lot = await lotSource.getById(request.params.id)

  const lotImages = await lotSource.getAllImagesById(request.params.id)

  const lotImagesIds = lotImages.map(image => image.id)

  deleteLotPolicy(event, lot)

  await lotService.delete(request.params.id)

  try {
    await imageService.destroySafely(lotImagesIds)
  }
  catch (error) {
    logger.warn(`Failed to delete images for lot ${lot.id}. Images ids: ${lotImagesIds.join(', ')}`, error)
  }
})
