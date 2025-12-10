import { authService } from '#domains/authentication'
import { userProfileResource, userRepository } from '#domains/users'
import { loginRequest } from './index.request'

export default defineEventHandler(async (event) => {
  await useRateLimiter(event, {
    authenticatedLimit: 0,
    anonymousLimit: 40,
    duration: 60,
  })

  const request = await loginRequest(event)

  const user = await userRepository.findByUsername(request.body.username)

  if (!user) {
    throw createAppError('ACCOUNT_NOT_FOUND', {
      username: request.body.username,
    })
  }

  const passwordsEqual = await comparePassword(
    request.body.password,
    user.password,
  )

  if (!passwordsEqual) {
    throw createAppError('INVALID_PASSWORD')
  }

  const metadata = createRequestMeta(event)

  const session = await authService.createSession(user.id, metadata)

  setRefreshTokenCookie(event, session.refreshToken)

  return {
    user: userProfileResource.make(user),
    access_token: session.accessToken,
    refresh_token: session.refreshToken,
    session_uuid: session.uuid,
  }
})
