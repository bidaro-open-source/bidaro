import { z } from 'zod'
import { hash } from 'bcrypt'
import { Op } from 'sequelize'
import { User } from '~/server/database'

const registerSchema = z.object({
  username: z.string(),
  password: z.string(),
  email: z.string().email(),
})

export default defineEventHandler(async (event) => {
  const validatedBody = await readValidatedBody(event, body => registerSchema.parse(body))

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
