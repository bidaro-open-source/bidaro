import { z } from 'zod'
import { passwordSchema } from '~/server/schemas'

export const bodySchema = z.object({
  token: z.string(),
  password: passwordSchema,
})

export type RequestBody = z.infer<typeof bodySchema>

export async function confirmResetPasswordRequest(event: H3Event) {
  return {
    body: await readValidatedBody(event, body => bodySchema.parse(body)),
  }
}
