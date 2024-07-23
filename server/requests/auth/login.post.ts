import { z } from 'zod'
import { passwordSchema, usernameSchema } from '~/server/zod'

export const bodySchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
})

export type RequestBody = z.infer<typeof bodySchema>

export async function loginRequest(event: H3Event) {
  return {
    body: await readValidatedBody(event, body => bodySchema.parse(body)),
  }
}
