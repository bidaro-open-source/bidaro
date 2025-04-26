import { getSessionsPolicy } from '~/server/policies/users/sessions'
import { getAuthenticationSessions } from '~/server/services/authentication'

export default defineEventHandler(async (event) => {
  const user = mustBeAuthenticated(event)

  mustBeAuthorized(event, getSessionsPolicy)

  const sessions = await getAuthenticationSessions(user.id)

  return Object.values(sessions)
})
