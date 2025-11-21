import { z } from 'zod'
import { userSchema } from '~~/server/zod'

export type ResetPasswordRequest = ValidatorReturnType<
  typeof resetPasswordRequest
>

export const resetPasswordRequest = createRequestValidator({
  body: z.object({
    email: userSchema.email,
  }),
})
