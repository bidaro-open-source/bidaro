import { z } from 'zod'
import { passwordSchema, usernameSchema } from '~~/server/zod'

export const bodySchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
})

export type LoginRequest = Awaited<ReturnType<typeof loginRequest>>

export async function loginRequest(event: H3Event) {
  return {
    body: await readValidatedBody(event, bodySchema.parse),
  }
}
