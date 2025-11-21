import z from 'zod'

export const categorySchema = {
  name: z
    .string({
      error: issue => issue.input === undefined
        ? 'Заголовок є обов’язковим'
        : 'Заголовок має бути рядком',
    })
    .trim()
    .min(1, { error: 'Заголовок не може бути порожнім' })
    .max(128, { error: 'Заголовок має містити не більше 128 символів' })
    .regex(/^(?=.*[a-z])[\w\s\-.,!?()]+$/i, { error: 'Заголовок містить недопустимі символи' }),

  description: z
    .string({
      error: issue => issue.input === undefined
        ? 'Опис є обов’язковим'
        : 'Опис має бути рядком',
    })
    .trim()
    .max(1024, { error: 'Опис має містити не більше 1024 символів' }),
}
