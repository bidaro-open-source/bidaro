import z from 'zod'

export type ViewProfileBetsRequest = ValidatorReturnType<typeof viewProfileBetsRequest>

export const viewProfileBetsRequest = createRequestValidator({
  query: z.object({
    page: z.coerce.number()
      .int()
      .min(1)
      .optional()
      .default(1),

    limit: z.coerce.number()
      .int()
      .min(1)
      .max(10)
      .optional()
      .default(10),
  }),
})
