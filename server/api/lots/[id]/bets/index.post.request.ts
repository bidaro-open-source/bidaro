import { z } from 'zod'
import { lotBetSchema, primaryKeySchema } from '~~/server/zod'

export type CreateLotBetRequest = ValidatorReturnType<typeof createLotBetRequest>

export const createLotBetRequest = createRequestValidator({
  params: z.object({
    id: primaryKeySchema,
  }),
  body: z.object({
    amount: lotBetSchema.amount,
  }),
})
