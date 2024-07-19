import { z } from 'zod'
import { emailSchema } from '~/server/schemas'

export const bodySchema = z.object({
  email: emailSchema,
})

export type RequestBody = z.infer<typeof bodySchema>

export async function parseRequest(event: H3Event) {
  const result = await readValidatedBody(
    event,
    body => bodySchema.safeParse(body),
  )

  if (!result.success) {
    throw createError({
      statusCode: 422,
      message: 'Неправильні дані запиту',
      data: result.error.flatten(),
    })
  }

  return result.data
}
