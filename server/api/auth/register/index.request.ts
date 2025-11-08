import { z } from 'zod'
import { emailSchema, passwordSchema, usernameSchema } from '~~/server/zod'

export type RegisterRequest = ValidatorReturnType<typeof registerRequest>

export const registerRequest = createRequestValidator({
  body: z.object({
    email: emailSchema,
    username: usernameSchema,
    password: passwordSchema,
  }),
})
