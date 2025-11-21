import { z } from 'zod'
import { primaryKeySchema, refreshTokenSchema } from '~~/server/zod'

export type DeleteSessionsRequest = ValidatorReturnType<typeof deleteSessionsRequest>

export const deleteSessionsRequest = createRequestValidator({
  params: z.object({
    id: primaryKeySchema,
  }),
  body: z.object({
    uuids: refreshTokenSchema
      .array()
      .min(1, { message: 'Масив ідентифікаторів не може бути порожнім' }),
  }),
})
