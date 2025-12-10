import { authService } from '#domains/authentication'
import { userProfileResource, userRepository } from '#domains/users'
import { refreshRequest } from './index.request'

export default defineEventHandler(async (event) => {
  await useRateLimiter(event, {
    authenticatedLimit: 10,
    anonymousLimit: 0,
    duration: 60,
  })

  const request = await refreshRequest(event)

  const oldSession = await authService.getSession(request.body.refresh_token)

  if (!oldSession) {
    deleteRefreshTokenCookie(event)

    throw createAppError('REFRESH_TOKEN_NOT_FOUND')
  }

  const user = await userRepository.findByPk(oldSession.uid)

  if (!user) {
    deleteRefreshTokenCookie(event)

    throw createAppError('USER_NOT_FOUND', { id: oldSession.uid })
  }

  const metadata = createRequestMeta(event)

  const session = await authService.updateSession(
    request.body.refresh_token,
    metadata,
  )

  setRefreshTokenCookie(event, session.refreshToken)

  return {
    user: userProfileResource.make(user),
    token_type: 'bearer',
    access_token: session.accessToken,
    refresh_token: session.refreshToken,
    session_uuid: session.uuid,
  }
})
