import { authService } from '~~/server/domains/authentication'
import { logoutRequest } from './index.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const user = getAuthenticatedUser(event)

  const request = await logoutRequest(event)

  const session = await authService.getSession(request.body.refresh_token)

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

  await authService.deleteSession(session.uid, request.body.refresh_token)

  deleteRefreshTokenCookie(event)

  return { ok: true }
})
