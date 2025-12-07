import { authService } from '#domains/authentication'
import { deleteSessionsRequest } from './index.delete.request'
import { deleteSessionsPolicy } from './index.policy'

/**
 * API endpoint handler
 */
export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  await useRateLimiter(event, {
    authenticatedLimit: 20,
    anonymousLimit: 0,
    duration: 60,
  })

  const request = await deleteSessionsRequest(event)

  deleteSessionsPolicy(event, request.params.id)

  const sessions = await authService.deleteSessions(
    request.params.id,
    request.body.uuids,
  )

  return sessions
})
