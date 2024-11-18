import { getSessionsPolicy } from '~/server/policies/user/sessions'
import { getSessionsRequest } from '~/server/requests/user/sessions'
import { getAuthenticationSessions } from '~/server/services/authentication'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await validateRequest(event, getSessionsRequest)

  mustBeAuthorized(event, getSessionsPolicy, request.params.uid)

  const sessions = await getAuthenticationSessions(request.params.uid)

  return Object.values(sessions)
})
