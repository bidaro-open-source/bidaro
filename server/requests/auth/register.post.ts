import { z } from 'zod'

export const schema = z.object({
  username: z.string().trim().min(2).max(24).regex(/^(?=.*[a-z])\w+$/i),
  password: z.string().trim().min(1).max(64),
  email: z.string().trim().min(1).max(254).email(),
})

export type RequestBody = z.infer<typeof schema>

export function parseRequest(event: H3Event) {
  return readValidatedBody(event, body => schema.parse(body))
}
