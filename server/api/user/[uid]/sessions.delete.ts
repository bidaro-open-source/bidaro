import { parseRequest } from '~/server/requests/user/sessions.delete'
import {
  deleteAuthenticationSession,
  getAuthenticationSessions,
} from '~/server/services/authentication'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const { body, params } = await parseRequest(event)

  if (event.context.auth.uid !== params.uid) {
    throw createError({
      statusCode: 403,
      message: 'Немає доступу',
    })
  }

  const sessions = await getAuthenticationSessions(params.uid)

  const handledSessions = Array
    .from<boolean>({ length: body.uuids.length })
    .fill(false)

  for (const refreshToken in sessions) {
    const session = sessions[refreshToken]

    const sessionIndex = body.uuids.findIndex(uuid => uuid === session.uuid)

    if (sessionIndex !== -1) {
      try {
        await deleteAuthenticationSession(params.uid, refreshToken)
        handledSessions[sessionIndex] = true
      }
      catch (e) {
        handledSessions[sessionIndex] = false
      }
    }
  }

  return handledSessions
})
