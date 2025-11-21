import z from 'zod'

export const categoryNameSchema = z
  .string({
    required_error: 'Заголовок є обов’язковим',
    invalid_type_error: 'Заголовок має бути рядком',
  })
  .trim()
  .min(1, 'Заголовок не може бути порожнім')
  .max(128, 'Заголовок має містити не більше 128 символів')
  .regex(/^(?=.*[a-z])[\w\s\-.,!?()]+$/i, 'Заголовок містить недопустимі символи')

export const categoryDescriptionSchema = z
  .string({
    invalid_type_error: 'Опис має бути рядком',
  })
  .trim()
  .max(1024, 'Опис має містити не більше 1024 символів')
  .optional()
