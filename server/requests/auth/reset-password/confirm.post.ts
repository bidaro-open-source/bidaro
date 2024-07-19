import { z } from 'zod'
import { passwordSchema } from '~/server/schemas'

export const bodySchema = z.object({
  token: z.string(),
  password: passwordSchema,
})

export type RequestBody = z.infer<typeof bodySchema>

export async function parseRequest(event: H3Event) {
  const resultBody = await readValidatedBody(
    event,
    body => bodySchema.safeParse(body),
  )

  if (!resultBody.success) {
    throw createError({
      statusCode: 422,
      message: 'Неправильні дані в query',
      data: resultBody.error.flatten(),
    })
  }

  return resultBody.data
}
