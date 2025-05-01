import { z } from 'zod'
import { loginRequest } from '~/server/requests/auth/login.post'
import { createAuthenticationSession } from '~/server/services/authentication'
import { fetchUserByUsername } from '~/server/services/users-service'

export default defineEventHandler(async (event) => {
  const request = await validateRequest(event, loginRequest)

  const user = await fetchUserByUsername(request.body.username)

  if (!user) {
    throw createError({
      statusCode: 404,
      message: 'Аккаунт не знайдено',
    })
  }

  const passwordsEqual = await comparePassword(
    event,
    request.body.password,
    user.password,
  )

  if (!passwordsEqual) {
    const issues: z.ZodIssue[] = [{
      code: 'custom',
      path: ['password'],
      message: 'Пароль неправильний',
    }]

    throw createError({
      statusCode: 422,
      message: 'Неправильні дані запиту',
      data: new z.ZodError(issues).flatten(),
    })
  }

  const metadata = createRequestMetadata(event)

  const session = await createAuthenticationSession(user.id, metadata)

  setRefreshTokenCookie(event, session.refreshToken)

  return {
    access_token: session.accessToken,
    refresh_token: session.refreshToken,
    session_uuid: session.uuid,
    user: {
      id: user.id as number,
      email: user.email,
      username: user.username,
    },
    role: user.role
      ? { name: user.role.name }
      : null,
    permissions: user.role
      ? user.role.permissions
        ? user.role.permissions.map(p => ({
            name: p.name,
            displayName: p.displayName,
            description: p.description,
          }))
        : []
      : [],
  }
})
