import { z } from 'zod'
import { idSchema } from '~/server/zod'

export const paramsSchema = z.object({
  uid: idSchema,
})

export type RequestParams = z.infer<typeof paramsSchema>

export async function parseRequest(event: H3Event) {
  const result = await getValidatedRouterParams(
    event,
    body => paramsSchema.safeParse(body),
  )

  if (!result.success) {
    throw createError({
      statusCode: 422,
      message: 'Неправильні дані в URL',
      data: result.error.flatten(),
    })
  }

  return result.data
}
