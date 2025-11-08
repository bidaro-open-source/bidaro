import { z } from 'zod'
import { primaryKeySchema } from '~~/server/zod/primary-key'

export type GetUserRequest = ValidatorReturnType<typeof getUserRequest>
export const getUserRequest = createRequestValidator({
  params: z.object({
    id: primaryKeySchema,
  }),
})
