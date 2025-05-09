import { z } from 'zod'

export const bodySchema = z.object({
  token: z.string(),
})

export type EmailVerifyConfirmRequest = Awaited<
  ReturnType<typeof emailVerifyConfirmRequest>
>

export async function emailVerifyConfirmRequest(event: H3Event) {
  return {
    body: await readValidatedBody(event, bodySchema.parse),
  }
}
