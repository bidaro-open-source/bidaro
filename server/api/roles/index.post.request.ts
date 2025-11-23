import z from 'zod'
import { roleSchema } from '~~/server/zod'

export type CreateRoleRequest = ValidatorReturnType<typeof createRoleRequest>

export const createRoleRequest = createRequestValidator({
  body: z.object({
    name: roleSchema.name,
    displayName: roleSchema.displayName.optional().nullable(),
    description: roleSchema.description.optional().nullable(),
  }),
})
