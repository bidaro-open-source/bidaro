import { z } from 'zod'
import {
  emailSchema,
  nameSchema,
  passwordSchema,
  surnameSchema,
} from '~~/server/zod'

export type UpdateProfileRequest = ValidatorReturnType<typeof updateProfileRequest>

export const updateProfileRequest = createRequestValidator({
  body: z.object({
    email: z.optional(emailSchema),
    password: z.optional(passwordSchema),
    name: z.optional(nameSchema),
    surname: z.optional(surnameSchema),
  }),
})
