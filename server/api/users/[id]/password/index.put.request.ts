import z from 'zod'
import { passwordSchema, primaryKeySchema } from '~~/server/zod'

export type UpdateUserPasswordRequest = ValidatorReturnType<typeof updateUserPasswordRequest>

export const updateUserPasswordRequest = createRequestValidator({
  params: z.object({
    id: primaryKeySchema,
  }),
  body: z.object({
    password: passwordSchema,
  }),
})
