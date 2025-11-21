import z from 'zod'

export const roleSchema = {
  name: z
    .string({
      error: issue => issue.input === undefined
        ? 'Назва є обов\'язковою'
        : 'Назва має бути рядком',
    })
    .trim()
    .min(1, { error: 'Назва не може бути порожньою' })
    .max(64, { error: 'Назва має містити не більше 64 символів' })
    .regex(/^(?=.*[a-z])\w+$/i, { error: 'Назва містить недопустимі символи' }),

  displayName: z
    .string({
      error: issue => issue.input === undefined
        ? 'Відображувана назва є обов\'язковою'
        : 'Відображувана назва має бути рядком',
    })
    .trim()
    .max(64, { error: 'Відображувана назва має містити не більше 64 символів' })
    .regex(
      /^\p{L}[\p{L}0-9 _–]*$/u,
      { error: 'Відображувана назва містить недопустимі символи' },
    ),

  description: z
    .string({
      error: issue => issue.input === undefined
        ? 'Опис є обов\'язковим'
        : 'Опис має бути рядком',
    })
    .trim()
    .max(1024, { error: 'Опис має містити не більше 1024 символів' })
    .regex(
      /^[\p{L}\p{N}\p{P}\p{Zs}\n\r\t]+$/u,
      { error: 'Опис містить недопустимі символи' },
    ),
}
