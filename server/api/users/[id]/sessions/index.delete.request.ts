import { z } from 'zod'
import { primaryKeySchema, refreshTokenSchema } from '~~/server/zod'

export type DeleteSessionsRequest = ValidatorReturnType<typeof deleteSessionsRequest>

export const deleteSessionsRequest = createRequestValidator({
  params: z.object({
    id: primaryKeySchema,
  }),
  body: z.object({
    uuids: refreshTokenSchema.array().nonempty(),
  }),
})
