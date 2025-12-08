import { authService } from '#domains/authentication'
import { roleRepository } from '#domains/authorization'
import { challengeTokenService } from '#domains/security'
import { userProfileResource, userRepository } from '#domains/users'
import { roles } from '~~/server/constants'
import { registerRequest } from './index.request'

export default defineEventHandler(async (event) => {
  await useRateLimiter(event, {
    authenticatedLimit: 0,
    anonymousLimit: 5,
    duration: 60,
  })

  const request = await registerRequest(event)

  const config = useRuntimeConfig()

  if (config.challenge.enabled) {
    const isValid = await challengeTokenService.verify(request.body.captchaToken || '')

    if (!isValid) {
      throw createAppError('INVALID_CHALLENGE_SOLUTION')
    }
  }

  const userByEmail = await userRepository.findByEmail(request.body.email)

  const userByUsername = await userRepository.findByUsername(request.body.username)

  if (userByEmail || userByUsername) {
    const fieldErrors: Record<string, string[]> = {}

    if (userByEmail) {
      fieldErrors.email = ['Електронна пошта вже зайнята']
    }

    if (userByUsername) {
      fieldErrors.username = ['Ім\'я користувача вже зайняте']
    }

    throw createAppError('VALIDATION_ERROR', { fieldErrors })
  }

  const defaultRole = await roleRepository.findByPk(roles.USER)

  if (!defaultRole) {
    throw createAppError('DEFAULT_ROLE_NOT_FOUND')
  }

  const user = await userRepository.create({
    email: request.body.email,
    username: request.body.username,
    password: await hashPassword(request.body.password),
    roleName: defaultRole.name,
  })

  user.role = defaultRole

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
