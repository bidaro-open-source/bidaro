import { z } from 'zod'
import { userSchema } from '~~/server/zod'

export type ConfirmPasswordRequest = ValidatorReturnType<
  typeof confirmResetPasswordRequest
>

export const confirmResetPasswordRequest = createRequestValidator({
  body: z.object({
    token: z.string(),
    password: userSchema.password,
  }),
})
