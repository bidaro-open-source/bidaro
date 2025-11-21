import { z } from 'zod'
import { primaryKeySchema } from '~~/server/zod'

export type GetSessionsRequest = ValidatorReturnType<typeof getSessionsRequest>

export const getSessionsRequest = createRequestValidator({
  params: z.object({
    id: primaryKeySchema,
  }),
})
