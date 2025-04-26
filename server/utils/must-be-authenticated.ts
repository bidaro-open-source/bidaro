import type { User } from '../database'

/**
 * Throws an nuxt error if the request is not authenticated by access token.
 *
 * @param event H3Event
 */
export default function (event: H3Event): User {
  if (!event.context.auth.isAuthenticated) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Необхідна авторизація',
    })
  }

  return event.context.auth.user as User
}
