import { z } from 'zod'
import { primaryKeySchema } from '~~/server/zod'

export type DeleteLotImageRequest = ValidatorReturnType<typeof deleteLotImageRequest>

export const deleteLotImageRequest = createRequestValidator({
  params: z.object({
    id: primaryKeySchema,
  }),
  body: z.object({
    ids: z
      .array(primaryKeySchema)
      .min(1, { message: 'Масив ідентифікаторів не може бути порожнім' }),
  }),
})
