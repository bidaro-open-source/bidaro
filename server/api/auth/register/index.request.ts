import { z } from 'zod'
import { userSchema } from '~~/server/zod'

export type RegisterRequest = ValidatorReturnType<typeof registerRequest>

export const registerRequest = createRequestValidator({
  body: z.object({
    email: userSchema.email,
    username: userSchema.username,
    password: userSchema.password,
  }),
})
