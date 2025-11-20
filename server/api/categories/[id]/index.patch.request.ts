import z from 'zod'
import { primaryKeySchema } from '~~/server/zod'

export type UpdateCategoryRequest = ValidatorReturnType<typeof updateCategoryRequest>

export const updateCategoryRequest = createRequestValidator({
  params: z.object({
    id: primaryKeySchema,
  }),
  body: z.object({
    displayName: z.string().optional(),
    description: z.string().optional(),
  }),
})
