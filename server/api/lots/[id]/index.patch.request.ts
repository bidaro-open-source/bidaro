import { z } from 'zod'
import { lotSchema, primaryKeySchema } from '~~/server/zod'

export type UpdateLotRequest = ValidatorReturnType<typeof updateLotRequest>

export const updateLotRequest = createRequestValidator({
  params: z.object({
    id: primaryKeySchema,
  }),
  body: z.object({
    title: lotSchema.title.optional(),
    description: lotSchema.description.optional(),
    categoryId: primaryKeySchema.optional(),
    initialPublish: z.boolean().optional(),
    initialPrice: lotSchema.initialPrice.optional(),
    initialDuration: lotSchema.duration.optional(),
  }),
})
