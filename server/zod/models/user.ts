import { z } from 'zod'

export const idSchema = z.union([
  z.string().transform((val, ctx) => {
    const parsed = Number(val)
    if (!Number.isInteger(parsed)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'ID користувача має бути числом.',
      })
      return z.NEVER
    }
    return parsed
  }),
  z.number(),
])

export const emailSchema = z
  .string({
    required_error: 'Електронна пошта є обов\'язковою',
    invalid_type_error: 'Електронна пошта має бути рядком',
  })
  .trim()
  .min(1, 'Електронна пошта не може бути порожньою')
  .max(254, 'Електронна пошта має містити не більше 254 символів')
  .email('Електронна пошта має бути дійсною')

export const usernameSchema = z
  .string({
    required_error: 'Ім\'я користувача є обов\'язковим',
    invalid_type_error: 'Ім\'я користувача має бути рядком',
  })
  .trim()
  .min(2, 'Ім\'я користувача має містити щонайменше 2 символи')
  .max(24, 'Ім\'я користувача має містити не більше 24 символів')
  .regex(/^(?=.*[a-z])\w+$/i, 'Ім\'я користувача містить недопустимі символи')

export const passwordSchema = z
  .string({
    required_error: 'Пароль є обов\'язковим',
    invalid_type_error: 'Пароль має бути рядком',
  })
  .trim()
  .min(1, 'Пароль не може бути порожнім')
  .max(64, 'Пароль має містити не більше 64 символів')
