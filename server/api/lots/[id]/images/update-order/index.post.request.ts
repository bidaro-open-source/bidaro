import { z } from 'zod'
import { primaryKeySchema } from '~~/server/zod'

export type UpdateImageOrderRequest = ValidatorReturnType<typeof updateImageOrderRequest>

export const updateImageOrderRequest = createRequestValidator({
  params: z.object({
    id: primaryKeySchema,
  }),
  body: z.object({
    ids: z
      .array(primaryKeySchema)
      .min(1, { message: 'Масив ідентифікаторів не може бути порожнім' }),
  }),
})
