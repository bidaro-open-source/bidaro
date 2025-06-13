import { z } from 'zod'
import { primaryKeySchema } from '../zod/primary-key'

export type GetCatalogRequest = ValidatorReturnType<typeof getCatalogRequest>
export const getCatalogRequest = createRequestValidator({
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(28),
  }),
})

export type GetCatalogByCategoryRequest = ValidatorReturnType<typeof getCatalogByCategoryRequest>
export const getCatalogByCategoryRequest = createRequestValidator({
  params: z.object({
    id: primaryKeySchema,
  }),
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(28),
  }),
})
