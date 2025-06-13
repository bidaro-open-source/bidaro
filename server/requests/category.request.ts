import { z } from 'zod'
import { primaryKeySchema } from '~~/server/zod/primary-key'

export type GetCategoryRequest = ValidatorReturnType<typeof getCategoryRequest>
export const getCategoryRequest = createRequestValidator({
  params: z.object({
    id: primaryKeySchema,
  }),
})
