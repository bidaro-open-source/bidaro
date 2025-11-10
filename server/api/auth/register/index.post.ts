import { z } from 'zod'
import { roles } from '~~/server/constants'
import { roleRepository } from '~~/server/repositories/role.repository'
import { userRepository } from '~~/server/repositories/user.repository'
import { createProfileResource } from '~~/server/resources/profile.resource'
import { createAuthenticationSession } from '~~/server/services/authentication'
import { registerRequest } from './index.request'

export default defineEventHandler(async (event) => {
  const request = await registerRequest(event)

  const userByEmail = await userRepository.findByEmail(request.body.email)

  const userByUsername = await userRepository.findByUsername(request.body.username)

  if (userByEmail || userByUsername) {
    const issues: z.ZodIssue[] = []

    if (userByEmail) {
      issues.push({
        code: 'custom',
        path: ['email'],
        message: 'Електронна пошта вже зайнята',
      })
    }

    if (userByUsername) {
      issues.push({
        code: 'custom',
        path: ['username'],
        message: 'Ім\'я користувача вже зайняте',
      })
    }

    throw createError({
      statusCode: 422,
      message: 'Неправильні дані запиту',
      data: new z.ZodError(issues).flatten(),
    })
  }

  const defaultRole = await roleRepository.findByName(roles.USER)

  if (!defaultRole) {
    throw createError({
      statusCode: 500,
      message: 'Default role not found.',
    })
  }

  const user = await userRepository.create({
    email: request.body.email,
    username: request.body.username,
    password: await hashPassword(event, request.body.password),
    roleName: defaultRole.name,
  })

  user.role = defaultRole

  const metadata = createRequestMeta(event)

  const session = await createAuthenticationSession(user.id, metadata)

  setRefreshTokenCookie(event, session.refreshToken)

  return {
    user: createProfileResource(user),
    access_token: session.accessToken,
    refresh_token: session.refreshToken,
    session_uuid: session.uuid,
  }
})
