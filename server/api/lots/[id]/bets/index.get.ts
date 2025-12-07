import { lotBetResource, lotSource } from '#domains/auction'
import { userAnonymousResource } from '#domains/users'
import { viewLotRequest } from '../index.request'

/**
 * API endpoint handler
 */
export default defineEventHandler(async (event) => {
  await useRateLimiter(event, {
    authenticatedLimit: 40,
    anonymousLimit: 300,
    duration: 60,
  })

  const request = await viewLotRequest(event)

  const lot = await lotSource.getById(request.params.id)

  const betsWithUser = await lotSource.getAllBetsById(lot.id)

  return betsWithUser.map(bet => ({
    ...lotBetResource.make(bet),
    user: userAnonymousResource.make(bet.user),
  }))
})
