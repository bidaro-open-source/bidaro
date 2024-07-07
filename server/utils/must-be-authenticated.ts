/**
 * Throws an nuxt error if the request is not authenticated by access token.
 *
 * @param event H3Event
 */
export default function (event: H3Event) {
  if (!event.context.auth.isAuthenticated) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Auth is required.',
    })
  }
}
