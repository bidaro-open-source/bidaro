import { lotResource, lotService, lotSource } from '#domains/auction'
import { viewLotRequest } from '../index.request'
import { receiveLotPolicy } from './index.post.policy'

/**
 * API endpoint handler
 */
export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  await useRateLimiter(event, {
    authenticatedLimit: 10,
    anonymousLimit: 0,
    duration: 60,
  })

  const request = await viewLotRequest(event)

  const lot = await lotSource.getById(request.params.id)

  receiveLotPolicy(event, lot)

  const updatedLot = await lotService.receive(request.params.id)

  return lotResource.make(updatedLot)
})
