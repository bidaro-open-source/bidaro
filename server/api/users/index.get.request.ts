import z from 'zod'

export type ViewUsersRequest = ValidatorReturnType<typeof viewUsersRequest>

export const viewUsersRequest = createRequestValidator({
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

    filter: z.enum(['all', 'verified', 'unverified'])
      .optional()
      .default('all'),

    sortBy: z.enum(['username', 'email', 'createdAt'])
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
