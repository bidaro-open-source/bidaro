import z from 'zod'
import { primaryKeySchema, roleSchema } from '~~/server/zod'

export type UpdateUserRoleRequest = ValidatorReturnType<typeof updateUserRoleRequest>

export const updateUserRoleRequest = createRequestValidator({
  params: z.object({
    id: primaryKeySchema,
  }),
  body: z.object({
    roleName: z.union([roleSchema.name, z.null()]),
  }),
})
