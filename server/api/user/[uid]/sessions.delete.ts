import { parseRequest } from '~/server/requests/user/sessions.delete'
import { deleteAuthenticationSessions } from '~/server/services/authentication'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const { body, params } = await parseRequest(event)

  if (event.context.auth.uid !== params.uid) {
    throw createError({
      statusCode: 403,
      message: 'Немає доступу',
    })
  }

  return await deleteAuthenticationSessions(params.uid, body.uuids)
})
