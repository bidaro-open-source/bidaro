import { z } from 'zod'
import { getRefreshTokenCookie } from '~/server/utils/refresh-token-cookie'

export const schema = z.object({
  refresh_token: z.string().uuid().or(z.literal('')),
})

export type RequestBody = z.infer<typeof schema>

export function parseRequest(event: H3Event) {
  const refreshTokenCookie = getRefreshTokenCookie(event)

  if (refreshTokenCookie) {
    return schema.parseAsync({ refresh_token: refreshTokenCookie })
  }

  return readValidatedBody(event, body => schema.parse(body))
}
