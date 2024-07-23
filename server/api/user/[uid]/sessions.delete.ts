import { deleteSessionsRequest } from '~/server/requests/user/sessions'
import { deleteAuthenticationSessions } from '~/server/services/authentication'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await validateRequest(event, deleteSessionsRequest)

  if (event.context.auth.uid !== request.params.uid) {
    throw createError({
      statusCode: 403,
      message: 'Немає доступу',
    })
  }

  return await deleteAuthenticationSessions(
    request.params.uid,
    request.body.uuids,
  )
})
