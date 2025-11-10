import { deleteSessionsPolicy } from '~~/server/api/profile/sessions/index.policy'
import { deleteSessionsRequest } from '~~/server/api/profile/sessions/index.request'
import { deleteAuthenticationSessions } from '~~/server/services/authentication'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await deleteSessionsRequest(event)

  deleteSessionsPolicy(event)

  const user = getAuthenticatedUser(event)

  const sessions = await deleteAuthenticationSessions(
    user.id,
    request.body.uuids,
  )

  return sessions
})
