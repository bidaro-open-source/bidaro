import { z } from 'zod'
import { primaryKeySchema } from '~~/server/zod/primary-key'

export type GetLotRequest = ValidatorReturnType<typeof getLotRequest>

export const getLotRequest = createRequestValidator({
  params: z.object({
    id: primaryKeySchema,
  }),
})
