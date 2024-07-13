import { Op } from 'sequelize'
import { hash } from 'bcrypt'
import { parseRequest } from '~/server/requests/auth/register.post'
import { createAuthenticationSession } from '~/server/services/authentication'

export default defineEventHandler(async (event) => {
  const db = useDatabase(event)

  const data = await parseRequest(event)

  const userInDB = await db.User.findOne({
    where: {
      [Op.or]: [
        { email: data.email },
        { username: data.username },
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
    email: data.email,
    username: data.username,
    password: await hash(data.password, 10),
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
