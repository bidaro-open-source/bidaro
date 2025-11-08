import { z } from 'zod'

export type EmailVerifyConfirmRequest = ValidatorReturnType<
  typeof emailVerifyConfirmRequest
>

export const emailVerifyConfirmRequest = createRequestValidator({
  body: z.object({
    token: z.string(),
  }),
})
