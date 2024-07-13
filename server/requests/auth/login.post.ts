import { z } from 'zod'

export const schema = z.object({
  username: z.string().min(1).max(24).regex(/^(?=.*[a-z])\w+$/i),
  password: z.string().min(1).max(64),
})

export type RequestBody = z.infer<typeof schema>

export function parseRequest(event: H3Event) {
  return readValidatedBody(event, body => schema.parse(body))
}
