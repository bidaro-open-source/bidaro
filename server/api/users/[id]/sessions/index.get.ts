import { authService } from '~~/server/modules/authentication'
import { getSessionsRequest } from './index.get.request'
import { getSessionsPolicy } from './index.policy'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await getSessionsRequest(event)

  getSessionsPolicy(event, request.params.id)

  const sessions = await authService.getSessions(request.params.id)

  return Object.values(sessions)
})
