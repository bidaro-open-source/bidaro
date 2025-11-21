import z from 'zod'
import { emailSchema, primaryKeySchema } from '~~/server/zod'

export type UpdateUserEmailRequest = ValidatorReturnType<typeof updateUserEmailRequest>

export const updateUserEmailRequest = createRequestValidator({
  params: z.object({
    id: primaryKeySchema,
  }),
  body: z.object({
    email: emailSchema,
  }),
})
