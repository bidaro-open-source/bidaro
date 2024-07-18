import { z } from 'zod'
import { idSchema, refreshTokenSchema } from '~/server/schemas'

export const bodySchema = z.object({
  uuids: refreshTokenSchema.array().nonempty(),
})

export const paramsSchema = z.object({
  uid: idSchema,
})

export type RequestBody = z.infer<typeof bodySchema>
export type RequestParams = z.infer<typeof paramsSchema>

export async function parseRequest(event: H3Event) {
  const resultBody = await readValidatedBody(
    event,
    body => bodySchema.safeParse(body),
  )

  if (!resultBody.success) {
    throw createError({
      statusCode: 422,
      message: 'Неправильні дані запиту',
      data: resultBody.error.flatten(),
    })
  }

  const resultParams = await getValidatedRouterParams(
    event,
    body => paramsSchema.safeParse(body),
  )

  if (!resultParams.success) {
    throw createError({
      statusCode: 422,
      message: 'Неправильні дані в URL',
      data: resultParams.error.flatten(),
    })
  }

  return {
    body: resultBody.data,
    params: resultParams.data,
  }
}
