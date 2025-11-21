import z from 'zod'
import { primaryKeySchema, userSchema } from '~~/server/zod'

export type UpdateUserPasswordRequest = ValidatorReturnType<typeof updateUserPasswordRequest>

export const updateUserPasswordRequest = createRequestValidator({
  params: z.object({
    id: primaryKeySchema,
  }),
  body: z.object({
    password: userSchema.password,
  }),
})
