import { z } from 'zod'
import { passwordSchema } from '~~/server/zod'

export type ConfirmPasswordRequest = ValidatorReturnType<
  typeof confirmResetPasswordRequest
>

export const confirmResetPasswordRequest = createRequestValidator({
  body: z.object({
    token: z.string(),
    password: passwordSchema,
  }),
})
