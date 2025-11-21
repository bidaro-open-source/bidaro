import { z } from 'zod'
import { primaryKeySchema } from '~~/server/zod'

export type GetUserRequest = ValidatorReturnType<typeof getUserRequest>
export const getUserRequest = createRequestValidator({
  params: z.object({
    id: primaryKeySchema,
  }),
})
