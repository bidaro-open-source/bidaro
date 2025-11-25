import { z } from 'zod'
import { primaryKeySchema } from '~~/server/zod'

export type ViewUserRequest = ValidatorReturnType<typeof viewUserRequest>
export const viewUserRequest = createRequestValidator({
  params: z.object({
    id: primaryKeySchema,
  }),
})
