import { authService } from '~~/server/services/authentication.service'
import { deleteSessionsRequest } from './index.delete.request'
import { deleteSessionsPolicy } from './index.policy'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await deleteSessionsRequest(event)

  deleteSessionsPolicy(event, request.params.id)

  const user = getAuthenticatedUser(event)

  const sessions = await authService.deleteAuthenticationSessions(
    user.id,
    request.body.uuids,
  )

  return sessions
})
