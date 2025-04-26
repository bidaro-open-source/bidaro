import { z } from 'zod'

export const nameSchema = z
  .string({
    required_error: 'Назва є обов\'язковою',
    invalid_type_error: 'Назва має бути рядком',
  })
  .trim()
  .min(1, 'Назва не може бути порожньою')
  .max(64, 'Назва має містити не більше 64 символів')
  .regex(/^(?=.*[a-z])\w+$/i, 'Назва містить недопустимі символи')

export const displayNameSchema = z
  .string({
    required_error: 'Відображуване ім\'я є обов\'язковим',
    invalid_type_error: 'Відображуване ім\'я має бути рядком',
  })
  .trim()
  .max(64, 'Відображувана назва має містити не більше 64 символів')
  .regex(
    /^\p{L}[\p{L}0-9 _–]*$/u,
    'Відображувана назва містить недопустимі символи',
  )
  .optional()

export const descriptionSchema = z
  .string({
    required_error: 'Опис є обов\'язковим',
    invalid_type_error: 'Опис має бути рядком',
  })
  .trim()
  .max(1024, 'Опис має містити не більше 1024 символів')
  .regex(
    /^[\p{L}\p{N}\p{P}\p{Zs}\n\r\t]+$/u,
    'Опис містить недопустимі символи',
  )
  .optional()
