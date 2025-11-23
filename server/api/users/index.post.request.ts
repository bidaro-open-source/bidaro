import z from 'zod'
import { roleSchema, userSchema } from '~~/server/zod'

export type CreateUserRequest = ValidatorReturnType<typeof createUserRequest>

export const createUserRequest = createRequestValidator({
  body: z.object({
    email: userSchema.email,
    username: userSchema.username,
    password: userSchema.password,
    roleName: roleSchema.name.optional(),
  }),
})
