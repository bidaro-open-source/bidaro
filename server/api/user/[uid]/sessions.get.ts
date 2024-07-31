import { getSessionsRequest } from '~/server/requests/user/sessions'
import { getAuthenticationSessions } from '~/server/services/authentication'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await validateRequest(event, getSessionsRequest)

  if (event.context.auth.uid !== request.params.uid) {
    throw createError({
      statusCode: 403,
      message: 'Немає доступу',
    })
  }

  const sessions = await getAuthenticationSessions(request.params.uid)

  return Object.values(sessions)
})
