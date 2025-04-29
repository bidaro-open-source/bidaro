import { getSessionsPolicy } from '~/server/policies/users/sessions'
import { getAuthenticationSessions } from '~/server/services/authentication'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  mustBeAuthorized(event, getSessionsPolicy)

  const user = getAuthenticatedUser(event)

  const sessions = await getAuthenticationSessions(user.id)

  return Object.values(sessions)
})
