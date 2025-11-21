import z from 'zod'
import { nameSchema, primaryKeySchema, surnameSchema } from '~~/server/zod'

export type UpdateUserRequest = ValidatorReturnType<typeof updateUserRequest>

export const updateUserRequest = createRequestValidator({
  params: z.object({
    id: primaryKeySchema,
  }),
  body: z.object({
    name: nameSchema.optional().nullable(),
    surname: surnameSchema.optional().nullable(),
  }),
})
