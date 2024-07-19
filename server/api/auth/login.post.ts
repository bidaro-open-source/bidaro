import { z } from 'zod'
import { compare } from 'bcrypt'
import { loginRequest } from '~/server/requests/auth/login.post'
import { createAuthenticationSession } from '~/server/services/authentication'

export default defineEventHandler(async (event) => {
  const db = useDatabase(event)

  const request = await validateRequest(event, loginRequest)

  const user = await db.User.findOne({
    where: { username: request.body.username },
  })

  if (!user) {
    throw createError({
      statusCode: 404,
      message: 'Аккаунт не знайдено',
    })
  }

  const passwordsEqual = await compare(request.body.password, user.password)

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
    session_token: session.sessionToken,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
    },
  }
})
