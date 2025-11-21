import z from 'zod'
import { lotInitialDurations } from '~~/server/constants'

export const lotSchema = {
  title: z
    .string({
      error: issue => issue.input === undefined
        ? 'Заголовок є обов’язковим'
        : 'Заголовок має бути рядком',
    })
    .trim()
    .min(1, { error: 'Заголовок не може бути порожнім' })
    .max(128, { error: 'Заголовок має містити не більше 128 символів' })
    .regex(
      /^(?=.*[a-z])[\w\s\-.,!?()]+$/i,
      { error: 'Заголовок містить недопустимі символи' },
    ),

  description: z
    .string({
      error: issue => issue.input === undefined
        ? 'Опис є обов’язковим'
        : 'Опис має бути рядком',
    })
    .trim()
    .max(1028, { error: 'Опис має містити не більше 1028 символів' }),

  initialPrice: z
    .number({
      error: issue => issue.input === undefined
        ? 'Початкова ціна є обов’язковою'
        : 'Початкова ціна має бути числом',
    })
    .min(1, { error: 'Початкова ціна має бути не менше 1' })
    .max(99999999.99, { error: 'Початкова сума дуже велика' }),

  duration: z
    .enum(Object.values(lotInitialDurations), {
      error: issue => issue.input === undefined
        ? 'Тривалість лоту є обов’язковою'
        : 'Невірний формат тривалості лоту',
    }),
}
