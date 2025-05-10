import { z } from 'zod'
import { getRefreshTokenCookie } from '~~/server/utils/refresh-token-cookie'
import { refreshTokenSchema } from '~~/server/zod'

const bodySchema = z.object({
  refresh_token: refreshTokenSchema,
})

export type LogoutRequest = ValidatorReturnType<typeof logoutRequest>

export const logoutRequest = createRequestValidator({
  body: async (event) => {
    const refreshTokenCookie = getRefreshTokenCookie(event)
    let body

    if (refreshTokenCookie) {
      body = bodySchema.parse({ refresh_token: refreshTokenCookie })
    }
    else {
      body = bodySchema.parse(await readBody(event))
    }

    return body
  },
})
