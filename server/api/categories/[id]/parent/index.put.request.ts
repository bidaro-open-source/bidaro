import z from 'zod'
import { primaryKeySchema } from '~~/server/zod'

export type UpdateCategoryParentRequest = ValidatorReturnType<typeof updateCategoryParentRequest>

export const updateCategoryParentRequest = createRequestValidator({
  params: z.object({
    id: primaryKeySchema,
  }),
  body: z.object({
    parentId: primaryKeySchema.nullable(),
  }),
})
