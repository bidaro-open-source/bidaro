import { z } from 'zod'
import { hash } from 'bcrypt'
import { Op } from 'sequelize'
import { createAuthenticationSession } from '~/server/services/authentication'

const registerSchema = z.object({
  username: z.string(),
  password: z.string(),
  email: z.string().email(),
})

export default defineEventHandler(async (event) => {
  const db = useDatabase(event)

  const validatedBody = await readValidatedBody(
    event,
    body => registerSchema.parse(body),
  )

  const userInDB = await db.User.findOne({
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

  const user = await db.User.create({
    email: validatedBody.email,
    username: validatedBody.username,
    password: await hash(validatedBody.password, 10),
  })

  const metadata = createRequestMetadata(event)

  const session = await createAuthenticationSession(user.id, metadata)

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
