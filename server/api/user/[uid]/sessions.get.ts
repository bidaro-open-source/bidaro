import { parseRequest } from '~/server/requests/user/sessions.get'
import { getAuthenticationSessions } from '~/server/services/authentication'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const params = await parseRequest(event)

  if (event.context.auth.uid !== params.uid) {
    throw createError({
      statusCode: 403,
      message: 'Немає доступу',
    })
  }

  const sessions = await getAuthenticationSessions(params.uid)

  return Object.values(sessions)
})
