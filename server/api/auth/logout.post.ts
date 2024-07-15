import { parseRequest } from '~/server/requests/auth/logout.post'
import {
  deleteAuthenticationSession,
  getAuthenticationSession,
} from '~/server/services/authentication'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const { refresh_token: refreshToken } = await parseRequest(event)

  const session = await getAuthenticationSession(refreshToken)

  if (!session) {
    throw createError({
      statusCode: 404,
      message: 'Токен оновлення не знайдено',
    })
  }

  if (session.uid !== event.context.auth.uid) {
    throw createError({
      statusCode: 403,
      message: 'Немає доступу до цього токену',
    })
  }

  await deleteAuthenticationSession(session.uid, refreshToken)

  deleteRefreshTokenCookie(event)

  return { ok: true }
})
