import z from 'zod'
import { primaryKeySchema } from '~~/server/zod'

export type VerifyUserRequest = ValidatorReturnType<typeof verifyUserRequest>

export const verifyUserRequest = createRequestValidator({
  params: z.object({
    id: primaryKeySchema,
  }),
})
