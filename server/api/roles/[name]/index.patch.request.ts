import z from 'zod'
import { roleSchema } from '~~/server/zod'

export type UpdateRoleRequest = ValidatorReturnType<typeof updateRoleRequest>

export const updateRoleRequest = createRequestValidator({
  params: z.object({
    name: roleSchema.name,
  }),
  body: z.object({
    displayName: roleSchema.displayName.optional(),
    description: roleSchema.description.optional(),
  }),
})
