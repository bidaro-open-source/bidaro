import { z } from 'zod'
import { refreshTokenSchema } from '~/server/zod'
import { primaryKeySchema } from '~/server/zod/primary-key'

export const bodySchema = z.object({
  uuids: refreshTokenSchema.array().nonempty(),
})

export const paramsSchema = z.object({
  uid: primaryKeySchema,
})

export type SessionsRequestBody = z.infer<typeof bodySchema>

export type SessionsRequestParams = z.infer<typeof paramsSchema>

export async function getSessionsRequest(event: H3Event) {
  return {
    params: await getValidatedRouterParams(
      event,
      body => paramsSchema.parse(body),
    ),
  }
}

export async function deleteSessionsRequest(event: H3Event) {
  return {
    body: await readValidatedBody(
      event,
      body => bodySchema.parse(body),
    ),
    params: await getValidatedRouterParams(
      event,
      body => paramsSchema.parse(body),
    ),
  }
}
