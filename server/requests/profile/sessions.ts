import { z } from 'zod'
import { refreshTokenSchema } from '~/server/zod'

export const bodySchema = z.object({
  uuids: refreshTokenSchema.array().nonempty(),
})

export type DeleteSessionsRequest = Awaited<
  ReturnType<typeof deleteSessionsRequest>
>

export async function deleteSessionsRequest(event: H3Event) {
  return {
    body: await readValidatedBody(event, bodySchema.parse),
  }
}
