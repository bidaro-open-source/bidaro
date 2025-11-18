import { getSessionsPolicy } from '~~/server/api/profile/sessions/index.policy'
import { authService } from '~~/server/services/authentication.service'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  getSessionsPolicy(event)

  const user = getAuthenticatedUser(event)

  const sessions = await authService.getAuthenticationSessions(user.id)

  return Object.values(sessions)
})
