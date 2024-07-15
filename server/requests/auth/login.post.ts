import { z } from 'zod'
import { passwordSchema, usernameSchema } from '~/server/schemas'

export const schema = z.object({
  username: usernameSchema,
  password: passwordSchema,
})

export type RequestBody = z.infer<typeof schema>

export async function parseRequest(event: H3Event) {
  const result = await readValidatedBody(event, body => schema.safeParse(body))

  if (!result.success) {
    throw createError({
      statusCode: 422,
      message: 'Неправильні дані запиту',
      data: result.error.flatten(),
    })
  }

  return result.data
}
