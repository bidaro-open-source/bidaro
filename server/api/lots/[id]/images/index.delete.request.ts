import { z } from 'zod'
import { primaryKeySchema } from '~~/server/zod/primary-key'

export type DeleteLotImageRequest = ValidatorReturnType<typeof deleteLotImageRequest>

export const deleteLotImageRequest = createRequestValidator({
  params: z.object({
    id: primaryKeySchema,
  }),
  body: z.object({
    ids: z.number().array().nonempty(),
  }),
})
