import { z } from 'zod'
import { emailSchema } from '~~/server/zod'

export type ResetPasswordRequest = ValidatorReturnType<
  typeof resetPasswordRequest
>

export const resetPasswordRequest = createRequestValidator({
  body: z.object({
    email: emailSchema,
  }),
})
