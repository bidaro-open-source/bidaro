import { z } from 'zod'

export const paramsSchema = z.object({
  name: z.string().min(1).max(64),
})

export type GetRoleRequest = Awaited<ReturnType<typeof getRoleRequest>>

export async function getRoleRequest(event: H3Event) {
  return {
    params: await getValidatedRouterParams(event, paramsSchema.parse),
  }
}
