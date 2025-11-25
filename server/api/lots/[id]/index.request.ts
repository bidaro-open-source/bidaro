import { z } from 'zod'
import { primaryKeySchema } from '~~/server/zod'

export type ViewLotRequest = ValidatorReturnType<typeof viewLotRequest>

export const viewLotRequest = createRequestValidator({
  params: z.object({
    id: primaryKeySchema,
  }),
})
