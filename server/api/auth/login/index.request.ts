import { z } from 'zod'
import { passwordSchema, usernameSchema } from '~~/server/zod'

export type LoginRequest = ValidatorReturnType<typeof loginRequest>

export const loginRequest = createRequestValidator({
  body: z.object({
    username: usernameSchema,
    password: passwordSchema,
  }),
})
