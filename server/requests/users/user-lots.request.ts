import { z } from 'zod'
import { primaryKeySchema } from '~~/server/zod/primary-key'

export type GetUserLotsRequest = ValidatorReturnType<typeof getUserLotsRequest>
export const getUserLotsRequest = createRequestValidator({
  params: z.object({
    id: primaryKeySchema,
  }),
})
