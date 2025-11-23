import z from 'zod'
import { primaryKeySchema } from '~~/server/zod'

export type DeleteUserRequest = ValidatorReturnType<typeof deleteUserRequest>

export const deleteUserRequest = createRequestValidator({
  params: z.object({
    id: primaryKeySchema,
  }),
})
