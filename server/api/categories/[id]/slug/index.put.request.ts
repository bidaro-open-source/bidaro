import z from 'zod'
import { primaryKeySchema, slugSchema } from '~~/server/zod'

export type UpdateCategorySlugRequest = ValidatorReturnType<typeof updateCategorySlugRequest>

export const updateCategorySlugRequest = createRequestValidator({
  params: z.object({
    id: primaryKeySchema,
  }),
  body: z.object({
    slug: slugSchema,
  }),
})
