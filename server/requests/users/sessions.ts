import { z } from 'zod'
import { refreshTokenSchema } from '~/server/zod'
import { primaryKeySchema } from '~/server/zod/primary-key'

export const bodySchema = z.object({
  uuids: refreshTokenSchema.array().nonempty(),
})

export const paramsSchema = z.object({
  uid: primaryKeySchema,
})

export type GetSessionsRequest = Awaited<
  ReturnType<typeof getSessionsRequest>
>

export async function getSessionsRequest(event: H3Event) {
  return {
    params: await getValidatedRouterParams(event, paramsSchema.parse),
  }
}

export type DeleteSessionsRequest = Awaited<
  ReturnType<typeof deleteSessionsRequest>
>

export async function deleteSessionsRequest(event: H3Event) {
  return {
    body: await readValidatedBody(event, bodySchema.parse),
    params: await getValidatedRouterParams(event, paramsSchema.parse),
  }
}
