import { z } from 'zod'
import { primaryKeySchema } from '~~/server/zod'

export type ViewSessionsRequest = ValidatorReturnType<typeof viewSessionsRequest>

export const viewSessionsRequest = createRequestValidator({
  params: z.object({
    id: primaryKeySchema,
  }),
})
