import { deleteSessionsPolicy } from '~/server/policies/users/sessions'
import { deleteSessionsRequest } from '~/server/requests/users/sessions'
import { deleteAuthenticationSessions } from '~/server/services/authentication'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await validateRequest(event, deleteSessionsRequest)

  mustBeAuthorized(event, deleteSessionsPolicy)

  const user = getAuthenticatedUser(event)

  const sessions = await deleteAuthenticationSessions(
    user.id,
    request.body.uuids,
  )

  return sessions
})
