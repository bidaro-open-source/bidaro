import { z } from 'zod'
import { emailSchema, passwordSchema, usernameSchema } from '~/server/zod'

export const bodySchema = z.object({
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema,
})

export type RequestBody = z.infer<typeof bodySchema>

export async function registerRequest(event: H3Event) {
  return {
    body: await readValidatedBody(event, body => bodySchema.parse(body)),
  }
}
