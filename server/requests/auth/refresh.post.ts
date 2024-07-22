import { z } from 'zod'
import { refreshTokenSchema } from '~/server/zod'
import { getRefreshTokenCookie } from '~/server/utils/refresh-token-cookie'

export const bodySchema = z.object({
  refresh_token: refreshTokenSchema,
})

export type RequestBody = z.infer<typeof bodySchema>

export async function refreshRequest(event: H3Event) {
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
