import { z } from 'zod'
import { primaryKeySchema } from '../zod/primary-key'

export const paramsSchema = z.object({
  id: primaryKeySchema,
})

export async function getPermissionRequest(event: H3Event) {
  return {
    params: await getValidatedRouterParams(
      event,
      body => paramsSchema.parse(body),
    ),
  }
}
