import { z } from 'zod'
import { emailSchema, passwordSchema } from '~/server/zod'

export const bodySchema = z.object({
  email: z.optional(emailSchema),
  password: z.optional(passwordSchema),
})

export type UpdateProfileRequest = Awaited<
  ReturnType<typeof updateProfileRequest>
>

export async function updateProfileRequest(event: H3Event) {
  return {
    body: await readValidatedBody(event, bodySchema.parse),
  }
}
