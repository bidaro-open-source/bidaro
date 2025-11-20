import z from 'zod'
import {
  categoryDescriptionSchema,
  categoryNameSchema,
  primaryKeySchema,
} from '~~/server/zod'

export type UpdateCategoryRequest = ValidatorReturnType<typeof updateCategoryRequest>

export const updateCategoryRequest = createRequestValidator({
  params: z.object({
    id: primaryKeySchema,
  }),
  body: z.object({
    displayName: categoryNameSchema.optional(),
    description: categoryDescriptionSchema.optional(),
  }),
})
