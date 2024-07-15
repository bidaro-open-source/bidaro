import { compare } from 'bcrypt'
import { parseRequest } from '~/server/requests/auth/login.post'
import { createAuthenticationSession } from '~/server/services/authentication'

export default defineEventHandler(async (event) => {
  const db = useDatabase(event)

  const data = await parseRequest(event)

  const user = await db.User.findOne({
    where: { username: data.username },
  })

  if (!user) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Account not found!',
    })
  }

  const passwordsEqual = await compare(data.password, user.password)

  if (!passwordsEqual) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Password is incorrect!',
    })
  }

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
