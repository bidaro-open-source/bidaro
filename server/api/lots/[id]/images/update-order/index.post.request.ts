import { z } from 'zod'
import { primaryKeySchema } from '~~/server/zod/primary-key'

export type UpdateImageOrderRequest = ValidatorReturnType<typeof updateImageOrderRequest>

export const updateImageOrderRequest = createRequestValidator({
  params: z.object({
    id: primaryKeySchema,
  }),
  body: z.object({
    ids: z.number().array().nonempty(),
  }),
})
