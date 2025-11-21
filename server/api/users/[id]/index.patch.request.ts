import z from 'zod'
import { primaryKeySchema, userSchema } from '~~/server/zod'

export type UpdateUserRequest = ValidatorReturnType<typeof updateUserRequest>

export const updateUserRequest = createRequestValidator({
  params: z.object({
    id: primaryKeySchema,
  }),
  body: z.object({
    name: userSchema.name.optional().nullable(),
    surname: userSchema.surname.optional().nullable(),
  }),
})
