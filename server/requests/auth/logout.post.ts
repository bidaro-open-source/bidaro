import { z } from 'zod'
import { getRefreshTokenCookie } from '~/server/utils/refresh-token-cookie'
import { refreshTokenSchema } from '~/server/zod'

export const bodySchema = z.object({
  refresh_token: refreshTokenSchema,
})

export type RequestBody = z.infer<typeof bodySchema>

export async function logoutRequest(event: H3Event) {
  const refreshTokenCookie = getRefreshTokenCookie(event)
  let body

  if (refreshTokenCookie) {
    body = bodySchema.parse({ refresh_token: refreshTokenCookie })
  }
  else {
    body = await readValidatedBody(
      event,
      body => bodySchema.parse(body || {}),
    )
  }

  return {
    body,
  }
}
