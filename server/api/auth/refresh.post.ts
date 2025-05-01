import { refreshRequest } from '~/server/requests/auth/refresh.post'
import {
  getAuthenticationSession,
  updateAuthenticationSession,
} from '~/server/services/authentication'
import { fetchUser } from '~/server/services/users-service'

export default defineEventHandler(async (event) => {
  const request = await validateRequest(event, refreshRequest)

  const oldSession = await getAuthenticationSession(request.body.refresh_token)

  if (!oldSession) {
    throw createError({
      statusCode: 404,
      message: 'Токен оновлення не знайдено',
    })
  }

  const user = await fetchUser(oldSession.uid)

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Користувач до якого є доступ не існує',
    })
  }

  const metadata = createRequestMetadata(event)

  const session = await updateAuthenticationSession(
    request.body.refresh_token,
    metadata,
  )

  setRefreshTokenCookie(event, session.refreshToken)

  return {
    token_type: 'bearer',
    access_token: session.accessToken,
    refresh_token: session.refreshToken,
    session_uuid: session.uuid,
    user: {
      id: user.id as number,
      email: user.email,
      username: user.username,
    },
    role: user.role
      ? { name: user.role.name }
      : null,
    permissions: user.role
      ? user.role.permissions
        ? user.role.permissions.map(p => ({
            name: p.name,
            displayName: p.displayName,
            description: p.description,
          }))
        : []
      : [],
  }
})
