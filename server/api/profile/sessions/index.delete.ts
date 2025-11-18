import { deleteSessionsPolicy } from '~~/server/api/profile/sessions/index.policy'
import { deleteSessionsRequest } from '~~/server/api/profile/sessions/index.request'
import { authService } from '~~/server/services/authentication.service'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await deleteSessionsRequest(event)

  deleteSessionsPolicy(event)

  const user = getAuthenticatedUser(event)

  const sessions = await authService.deleteAuthenticationSessions(
    user.id,
    request.body.uuids,
  )

  return sessions
})
