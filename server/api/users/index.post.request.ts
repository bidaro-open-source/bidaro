import z from 'zod'
import { userSchema } from '~~/server/zod'

export type CreateUserRequest = ValidatorReturnType<typeof createUserRequest>

export const createUserRequest = createRequestValidator({
  body: z.object({
    email: userSchema.email,
    username: userSchema.username,
    password: userSchema.password,
    roleName: z.string().min(1).max(64).optional(),
  }),
})
