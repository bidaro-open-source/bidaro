import z from 'zod'
import { permissionSchema, roleSchema } from '~~/server/zod'

export type UpdateRolePermissionsRequest = ValidatorReturnType<typeof updateRolePermissionsRequest>

export const updateRolePermissionsRequest = createRequestValidator({
  params: z.object({
    name: roleSchema.name,
  }),
  body: z.object({
    permissions: z.array(permissionSchema.name),
  }),
})
