import { z } from 'zod'

export const paramsSchema = z.object({
  name: z.string().min(1).max(64),
})

export type GetPermissionRequest = Awaited<
  ReturnType<typeof getPermissionRequest>
>

export async function getPermissionRequest(event: H3Event) {
  return {
    params: await getValidatedRouterParams(event, paramsSchema.parse),
  }
}
