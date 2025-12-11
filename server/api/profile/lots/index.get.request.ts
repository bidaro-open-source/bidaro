import z from 'zod'

export type ViewProfileLotsRequest = ValidatorReturnType<typeof viewProfileLotsRequest>

export const viewProfileLotsRequest = createRequestValidator({
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
  }),
})
