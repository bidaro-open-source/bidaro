import { z } from 'zod'
import { userSchema } from '~~/server/zod'

export type LoginRequest = ValidatorReturnType<typeof loginRequest>

export const loginRequest = createRequestValidator({
  body: z.object({
    username: userSchema.username,
    password: userSchema.password,
  }),
})
