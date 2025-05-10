import { z } from 'zod'
import { refreshTokenSchema } from '~~/server/zod'

export type DeleteSessionsRequest = ValidatorReturnType<typeof deleteSessionsRequest>

export const deleteSessionsRequest = createRequestValidator({
  body: z.object({
    uuids: refreshTokenSchema.array().nonempty(),
  }),
})
