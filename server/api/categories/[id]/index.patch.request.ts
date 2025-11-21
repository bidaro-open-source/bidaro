import z from 'zod'
import { categorySchema, primaryKeySchema } from '~~/server/zod'

export type UpdateCategoryRequest = ValidatorReturnType<typeof updateCategoryRequest>

export const updateCategoryRequest = createRequestValidator({
  params: z.object({
    id: primaryKeySchema,
  }),
  body: z.object({
    displayName: categorySchema.name.optional(),
    description: categorySchema.description.optional(),
  }),
})
