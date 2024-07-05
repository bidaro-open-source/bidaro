import { z } from 'zod'
import { hash } from 'bcrypt'
import { Op } from 'sequelize'
import { User } from '~/server/database'
import { createAuthenticationSession } from '~/server/services/authentication'
import { setRefreshToken } from '~/server/services/authentication-cookie'

const registerSchema = z.object({
  username: z.string(),
  password: z.string(),
  email: z.string().email(),
})

export default defineEventHandler(async (event) => {
  const validatedBody = await readValidatedBody(
    event,
    body => registerSchema.parse(body),
  )

  const userInDB = await User.findOne({
    where: {
      [Op.or]: [
        { email: validatedBody.email },
        { username: validatedBody.username },
      ],
    },
  })

  if (userInDB) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Account already exists.',
    })
  }

  const user = await User.create({
    email: validatedBody.email,
    username: validatedBody.username,
    password: await hash(validatedBody.password, 10),
  })

  const session = await createAuthenticationSession(user.id, {
    ip: getRequestIP(event),
    ua: getRequestHeader(event, 'user-agent'),
  })

  setRefreshToken(event, session.refreshToken)

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
