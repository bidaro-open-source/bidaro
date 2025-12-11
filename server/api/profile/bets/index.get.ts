import { lotBetRepository, lotBetResource, lotResource } from '#domains/auction'
import { imageResource } from '#domains/storage'
import { userResource } from '#domains/users'
import { viewProfileBetsRequest } from './index.get.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  await useRateLimiter(event, {
    authenticatedLimit: 10,
    anonymousLimit: 0,
    duration: 60,
  })

  const request = await viewProfileBetsRequest(event)
  const user = getAuthenticatedUser(event)

  const offset = (request.query.page - 1) * request.query.limit

  const { rows, count } = await lotBetRepository.findUniqueLotsByUserId(
    user.id,
    request.query.limit,
    offset,
  )

  return {
    data: rows.map((lot) => {
      const lastBet = lot.bets && lot.bets.length > 0 ? lot.bets[0] : null

      return {
        ...lotResource.make(lot),
        seller: userResource.make(lot.seller),
        cover: imageResource.make(lot.cover?.image),
        lastBet: lotBetResource.make(lastBet),
      }
    }),
    meta: {
      totalItems: count,
      currentPage: request.query.page,
      itemsPerPage: request.query.limit,
    },
  }
})
