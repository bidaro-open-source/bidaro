import { authService } from '#domains/authentication'
import { viewSessionsRequest } from './index.get.request'
import { viewSessionsPolicy } from './index.policy'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await viewSessionsRequest(event)

  viewSessionsPolicy(event, request.params.id)

  const sessions = await authService.getSessions(request.params.id)

  return Object.values(sessions)
})
