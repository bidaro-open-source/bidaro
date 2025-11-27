import { lotImageRepository, lotSource } from '#domains/auction'
import { imageResource } from '#domains/storage'
import { viewLotRequest } from '../index.request'
import { viewLotImagesPolicy } from './index.get.policy'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  await useRateLimiter(event, {
    authenticatedLimit: 40,
    anonymousLimit: 0,
    duration: 60,
  })

  viewLotImagesPolicy(event)

  const request = await viewLotRequest(event)

  const lot = await lotSource.getById(request.params.id)

  const images = await lotImageRepository.findAllByLotId(lot.id)

  return imageResource.collection(images)
})
