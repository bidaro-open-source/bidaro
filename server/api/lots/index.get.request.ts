import z from 'zod'

export type ViewLotsRequest = ValidatorReturnType<typeof viewLotsRequest>

export const viewLotsRequest = createRequestValidator({
  query: z.object({
    page: z.coerce.number()
      .int()
      .min(1)
      .optional()
      .default(1),

    limit: z.coerce.number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .default(20),

    filter: z.enum([
      'all',
      'drafted',
      'published',
      'closed',
      'shipped',
      'completed',
      'rejected',
    ])
      .optional()
      .default('all'),

    sortBy: z.enum(['createdAt'])
      .optional()
      .default('createdAt'),

    sortOrder: z.enum(['asc', 'desc'])
      .optional()
      .default('desc')
      .transform(val => val.toUpperCase() as 'ASC' | 'DESC'),

    search: z.string()
      .optional()
      .default('')
      .transform(val => val.trim()),
  }),
})
