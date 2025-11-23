import z from 'zod'
import { primaryKeySchema } from '~~/server/zod'

export type UpdateUserRoleRequest = ValidatorReturnType<typeof updateUserRoleRequest>

export const updateUserRoleRequest = createRequestValidator({
  params: z.object({
    id: primaryKeySchema,
  }),
  body: z.object({
    roleName: z.union([z.string().min(1).max(64), z.null()]),
  }),
})
