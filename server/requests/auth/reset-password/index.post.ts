import { z } from 'zod'
import { emailSchema } from '~~/server/zod'

export const bodySchema = z.object({
  email: emailSchema,
})

export type ResetPasswordRequest = Awaited<
  ReturnType<typeof resetPasswordRequest>
>

export async function resetPasswordRequest(event: H3Event) {
  return {
    body: await readValidatedBody(event, bodySchema.parse),
  }
}
