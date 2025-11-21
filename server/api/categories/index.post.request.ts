import z from 'zod'
import { categorySchema, primaryKeySchema, slugSchema } from '~~/server/zod'

export type CreateCategoryRequest = ValidatorReturnType<typeof createCategoryRequest>

export const createCategoryRequest = createRequestValidator({
  body: z.object({
    slug: slugSchema,
    parentId: primaryKeySchema.optional(),
    displayName: categorySchema.name,
    description: categorySchema.description.optional(),
  }),
})
