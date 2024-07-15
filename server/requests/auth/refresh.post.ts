import { z } from 'zod'
import { refreshTokenSchema } from '~/server/schemas'
import { getRefreshTokenCookie } from '~/server/utils/refresh-token-cookie'

export const schema = z.object({
  refresh_token: refreshTokenSchema,
})

export type RequestBody = z.infer<typeof schema>

export async function parseRequest(event: H3Event) {
  const refreshTokenCookie = getRefreshTokenCookie(event)
  let result

  if (refreshTokenCookie) {
    result = schema.safeParse({ refresh_token: refreshTokenCookie })
  }
  else {
    result = await readValidatedBody(event, body => schema.safeParse(body))
  }

  if (!result.success) {
    throw createError({
      statusCode: 422,
      message: 'Неправильні дані запиту',
      data: result.error.flatten(),
    })
  }

  return result.data
}
