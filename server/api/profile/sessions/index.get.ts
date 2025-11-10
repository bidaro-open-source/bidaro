import { getSessionsPolicy } from '~~/server/api/profile/sessions/index.policy'
import { getAuthenticationSessions } from '~~/server/services/authentication'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  getSessionsPolicy(event)

  const user = getAuthenticatedUser(event)

  const sessions = await getAuthenticationSessions(user.id)

  return Object.values(sessions)
})
