import { logoutRequest } from '~/server/requests/auth/logout.post'
import {
  deleteAuthenticationSession,
  getAuthenticationSession,
} from '~/server/services/authentication'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const user = getAuthenticatedUser(event)

  const request = await validateRequest(event, logoutRequest)

  const session = await getAuthenticationSession(request.body.refresh_token)

  if (!session) {
    throw createError({
      statusCode: 404,
      message: 'Токен оновлення не знайдено',
    })
  }

  if (session.uid !== user.id) {
    throw createError({
      statusCode: 403,
      message: 'Немає доступу до цього токену',
    })
  }

  await deleteAuthenticationSession(session.uid, request.body.refresh_token)

  deleteRefreshTokenCookie(event)

  return { ok: true }
})
