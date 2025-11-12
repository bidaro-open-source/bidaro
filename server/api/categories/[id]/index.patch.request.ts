import z from 'zod'
import { primaryKeySchema, slugSchema } from '~~/server/zod'

export type UpdateCategoryRequest = ValidatorReturnType<typeof updateCategoryRequest>

export const updateCategoryRequest = createRequestValidator({
  params: z.object({
    id: primaryKeySchema,
  }),
  body: z.object({
    slug: slugSchema.optional(),
    displayName: z.string().optional(),
    description: z.string().optional(),
    parentId: z.number().nullish().optional(),
  }),
})
