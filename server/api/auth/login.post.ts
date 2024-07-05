import { z } from 'zod'
import { compare } from 'bcrypt'
import { User } from '~/server/database'
import { createAuthenticationSession } from '~/server/services/authentication'
import { setRefreshToken } from '~/server/services/authentication-cookie'

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
})

export default defineEventHandler(async (event) => {
  const validatedBody = await readValidatedBody(
    event,
    body => loginSchema.parse(body),
  )

  const user = await User.findOne({
    where: { username: validatedBody.username },
  })

  if (!user) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Account not found!',
    })
  }

  const passwordsEqual = await compare(validatedBody.password, user.password)

  if (!passwordsEqual) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Password is incorrect!',
    })
  }

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
