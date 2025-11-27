import { lotImageService, lotSource } from '#domains/auction'
import { updateImageOrderPolicy } from './index.post.policy'
import { updateImageOrderRequest } from './index.post.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  await useRateLimiter(event, {
    authenticatedLimit: 20,
    anonymousLimit: 0,
    duration: 60,
  })

  const request = await updateImageOrderRequest(event)

  const lot = await lotSource.getById(request.params.id)

  updateImageOrderPolicy(event, lot)

  await lotImageService.updateImageOrder(request.params.id, request.body.ids)
})
