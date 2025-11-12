import z from 'zod'
import { primaryKeySchema } from '~~/server/zod'

export type DeleteCategoryRequest = ValidatorReturnType<typeof deleteCategoryRequest>

export const deleteCategoryRequest = createRequestValidator({
  params: z.object({
    id: primaryKeySchema,
  }),
})
