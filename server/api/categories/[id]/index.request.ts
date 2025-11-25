import z from 'zod'
import { primaryKeySchema } from '~~/server/zod'

export type ViewCategoryRequest = ValidatorReturnType<typeof viewCategoryRequest>

export const viewCategoryRequest = createRequestValidator({
  params: z.object({
    id: primaryKeySchema,
  }),
})
