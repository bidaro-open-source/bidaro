import { z } from 'zod'
import { permissionSchema } from '~~/server/zod'

export type UpdatePermissionRequest = ValidatorReturnType<typeof updatePermissionRequest>

export const updatePermissionRequest = createRequestValidator({
  params: z.object({
    name: permissionSchema.name,
  }),
  body: z.object({
    displayName: permissionSchema.displayName.optional(),
    description: permissionSchema.description.optional(),
  }),
})
