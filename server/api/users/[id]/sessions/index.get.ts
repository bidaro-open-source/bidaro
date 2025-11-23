import { authService } from '~~/server/services/authentication.service'
import { getSessionsRequest } from './index.get.request'
import { getSessionsPolicy } from './index.policy'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await getSessionsRequest(event)

  getSessionsPolicy(event, request.params.id)

  const user = getAuthenticatedUser(event)

  const sessions = await authService.getSessions(user.id)

  return Object.values(sessions)
})
