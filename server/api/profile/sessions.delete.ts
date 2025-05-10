import { deleteSessionsPolicy } from '~~/server/policies/profile/sessions'
import { deleteSessionsRequest } from '~~/server/requests/profile/sessions'
import { deleteAuthenticationSessions } from '~~/server/services/authentication'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await deleteSessionsRequest(event)

  mustBeAuthorized(event, deleteSessionsPolicy)

  const user = getAuthenticatedUser(event)

  const sessions = await deleteAuthenticationSessions(
    user.id,
    request.body.uuids,
  )

  return sessions
})
