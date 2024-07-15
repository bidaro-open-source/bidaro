import { z } from 'zod'
import { Op } from 'sequelize'
import { hash } from 'bcrypt'
import { parseRequest } from '~/server/requests/auth/register.post'
import { createAuthenticationSession } from '~/server/services/authentication'

export default defineEventHandler(async (event) => {
  const db = useDatabase(event)

  const data = await parseRequest(event)

  const userInDB = await db.User.findAll({
    where: {
      [Op.or]: [
        { email: data.email },
        { username: data.username },
      ],
    },
  })

  if (userInDB.length) {
    const issues: z.ZodIssue[] = []

    if (userInDB.findIndex(u => u.email === data.email) !== -1) {
      issues.push({
        code: 'custom',
        path: ['email'],
        message: 'Електронна пошта вже зайнята',
      })
    }

    if (userInDB.findIndex(u => u.username === data.username) !== -1) {
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
    email: data.email,
    username: data.username,
    password: await hash(data.password, 10),
  })

  const metadata = createRequestMetadata(event)

  const session = await createAuthenticationSession(user.id, metadata)

  setRefreshTokenCookie(event, session.refreshToken)

  return {
    access_token: session.accessToken,
    refresh_token: session.refreshToken,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
    },
  }
})
