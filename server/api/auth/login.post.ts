import { z } from 'zod'
import { compare } from 'bcrypt'
import { User } from '~/server/database'

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
})

export default defineEventHandler(async (event) => {
  const validatedBody = await readValidatedBody(event, body => loginSchema.parse(body))

  const user = await User.findOne({ where: { username: validatedBody.username } })

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

  const jwt = encodeJWT(user.id)

  setCookie(event, 'jwt', jwt.refresh_token, {
    maxAge: +useRuntimeConfig().jwt.refreshTTL,
    httpOnly: true,
    sameSite: true,
    secure: true,
  })

  return {
    token_type: 'bearer',
    access_token: jwt.access_token,
    refresh_token: jwt.refresh_token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
    },
  }
})
