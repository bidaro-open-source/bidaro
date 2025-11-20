import z from 'zod'
import { primaryKeySchema } from '~~/server/zod'

export type GetCategoryRequest = ValidatorReturnType<typeof getCategoryRequest>

export const getCategoryRequest = createRequestValidator({
  params: z.object({
    id: primaryKeySchema,
  }),
})
