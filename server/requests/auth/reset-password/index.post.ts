import { z } from 'zod'
import { emailSchema } from '~/server/zod'

export const bodySchema = z.object({
  email: emailSchema,
})

export type RequestBody = z.infer<typeof bodySchema>

export async function resetPasswordRequest(event: H3Event) {
  return {
    body: await readValidatedBody(event, body => bodySchema.parse(body)),
  }
}
