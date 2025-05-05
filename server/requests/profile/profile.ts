import { z } from 'zod'
import {
  emailSchema,
  nameSchema,
  passwordSchema,
  surnameSchema,
} from '~~/server/zod'

export const bodySchema = z.object({
  email: z.optional(emailSchema),
  password: z.optional(passwordSchema),
  name: z.optional(nameSchema),
  surname: z.optional(surnameSchema),
})

export type UpdateProfileRequest = Awaited<
  ReturnType<typeof updateProfileRequest>
>

export async function updateProfileRequest(event: H3Event) {
  return {
    body: await readValidatedBody(event, bodySchema.parse),
  }
}
