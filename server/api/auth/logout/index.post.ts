import { authService } from '#domains/authentication'
import { createAppError } from '#utils/create-app-error'
import { logoutRequest } from './index.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  await useRateLimiter(event, {
    authenticatedLimit: 5,
    anonymousLimit: 0,
    duration: 60,
  })

  const user = getAuthenticatedUser(event)

  const request = await logoutRequest(event)

  const session = await authService.getSession(request.body.refresh_token)

  if (!session) {
    throw createAppError('REFRESH_TOKEN_NOT_FOUND')
  }

  if (session.uid !== user.id) {
    throw createAppError('REFRESH_TOKEN_ACCESS_DENIED')
  }

  await authService.deleteSession(session.uid, request.body.refresh_token)

  deleteRefreshTokenCookie(event)

  return { ok: true }
})
