import type { H3Event } from 'h3'

export default function (event: H3Event) {
  if (!event.context.auth.isAuthenticated) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Auth is required.',
    })
  }
}
