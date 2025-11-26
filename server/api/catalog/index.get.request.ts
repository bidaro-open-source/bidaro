import z from 'zod'
import { slugSchema } from '~~/server/zod/slug'

export type ViewCatalogRequest = ValidatorReturnType<typeof viewCatalogRequest>

export const viewCatalogRequest = createRequestValidator({
  query: z.object({
    page: z.coerce.number()
      .int()
      .min(1)
      .optional()
      .default(1),

    limit: z.coerce.number()
      .int()
      .min(1)
      .max(40)
      .optional()
      .default(20),

    category_slug: slugSchema.optional(),
  }),
})
