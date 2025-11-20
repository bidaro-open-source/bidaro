import z from 'zod'
import {
  categoryDescriptionSchema,
  categoryNameSchema,
  primaryKeySchema,
  slugSchema,
} from '~~/server/zod'

export type CreateCategoryRequest = ValidatorReturnType<typeof createCategoryRequest>

export const createCategoryRequest = createRequestValidator({
  body: z.object({
    slug: slugSchema,
    parentId: z.optional(primaryKeySchema),
    displayName: categoryNameSchema,
    description: categoryDescriptionSchema.optional(),
  }),
})
