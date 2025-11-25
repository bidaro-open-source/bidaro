import z from 'zod'
import { roleSchema } from '~~/server/zod'

export type ViewRoleRequest = ValidatorReturnType<typeof viewRoleRequest>

export const viewRoleRequest = createRequestValidator({
  params: z.object({
    name: roleSchema.name,
  }),
})
