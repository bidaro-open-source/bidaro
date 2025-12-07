import { lotService, lotSource } from '#domains/auction'
import { deleteLotPolicy } from './index.delete.policy'
import { viewLotRequest } from './index.request'

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

  deleteLotPolicy(event, lot)

  await lotService.delete(request.params.id)
})
