import { z } from 'zod'
import { Op } from 'sequelize'
import { registerRequest } from '~/server/requests/auth/register.post'
import { createAuthenticationSession } from '~/server/services/authentication'

export default defineEventHandler(async (event) => {
  const db = useDatabase(event)

  const request = await validateRequest(event, registerRequest)

  const userInDB = await db.User.findAll({
    where: {
      [Op.or]: [
        { email: request.body.email },
        { username: request.body.username },
      ],
    },
  })

  if (userInDB.length) {
    const issues: z.ZodIssue[] = []

    if (userInDB.findIndex(u => u.email === request.body.email) !== -1) {
      issues.push({
        code: 'custom',
        path: ['email'],
        message: 'Електронна пошта вже зайнята',
      })
    }

    if (userInDB.findIndex(u => u.username === request.body.username) !== -1) {
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

  const user = await db.User.create({
    email: request.body.email,
    username: request.body.username,
    password: await hashPassword(event, request.body.password),
  })

  const metadata = createRequestMetadata(event)

  const session = await createAuthenticationSession(user.id, metadata)

  setRefreshTokenCookie(event, session.refreshToken)

  return {
    access_token: session.accessToken,
    refresh_token: session.refreshToken,
    session_uuid: session.uuid,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
    },
  }
})
