import { lotRepository, lotResource } from '#domains/auction'
import { imageResource } from '#domains/storage'
import { viewProfileLotsRequest } from './index.get.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  await useRateLimiter(event, {
    authenticatedLimit: 60,
    anonymousLimit: 0,
    duration: 60,
  })

  const request = await viewProfileLotsRequest(event)
  const userId = getAuthenticatedUser(event).id

  const offset = (request.query.page - 1) * request.query.limit

  const { rows, count } = await lotRepository.findAllByOwnerIdWithCover(
    userId,
    request.query.limit,
    offset,
  )

  return {
    data: rows.map(lot => ({
      ...lotResource.make(lot),
      cover: imageResource.make(lot.cover?.image),
    })),
    meta: {
      totalItems: count,
      currentPage: request.query.page,
      itemsPerPage: request.query.limit,
    },
  }
})
