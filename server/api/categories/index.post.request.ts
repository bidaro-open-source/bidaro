import z from 'zod'
import { slugSchema } from '~~/server/zod'

export type CreateCategoryRequest = ValidatorReturnType<typeof createCategoryRequest>

export const createCategoryRequest = createRequestValidator({
  body: z.object({
    slug: slugSchema,
    displayName: z.string(),
    description: z.string().optional(),
    parentId: z.number().optional(),
  }),
})
