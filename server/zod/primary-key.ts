import { z } from 'zod'

export const primaryKeySchema = z.union([
  z.string().transform((val, ctx) => {
    const parsed = Number(val)
    if (!Number.isInteger(parsed)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'ID має бути числом.',
      })
      return z.NEVER
    }
    return parsed
  }),
  z.number(),
])
