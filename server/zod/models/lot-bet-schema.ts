import z from 'zod'

export const lotBetSchema = {
  amount: z
    .number({
      error: issue => issue.input === undefined
        ? 'Ціна є обов’язковою'
        : 'Ціна має бути числом',
    })
    .min(1, { error: 'Ціна має бути не менше 1' })
    .max(99999999.99, { error: 'Ціна дуже велика' }),

}
