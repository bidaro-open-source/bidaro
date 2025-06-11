import { z } from 'zod'
import { primaryKeySchema } from '~~/server/zod/primary-key'

export type LotRequest = ValidatorReturnType<typeof lotRequest>
export const lotRequest = createRequestValidator({
  params: z.object({
    id: primaryKeySchema,
  }),
})
