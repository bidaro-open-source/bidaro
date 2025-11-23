import z from 'zod'
import { roleSchema } from '~~/server/zod'

export type GetRoleRequest = ValidatorReturnType<typeof getRoleRequest>

export const getRoleRequest = createRequestValidator({
  params: z.object({
    name: roleSchema.name,
  }),
})
