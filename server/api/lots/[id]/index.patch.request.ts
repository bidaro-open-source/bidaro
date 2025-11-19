import { z } from 'zod'
import { lotInitialDurations } from '~~/server/constants'
import { descriptionSchema, titleSchema } from '~~/server/zod/models/lot'
import { primaryKeySchema } from '~~/server/zod/primary-key'

export type UpdateLotRequest = ValidatorReturnType<typeof updateLotRequest>

export const updateLotRequest = createRequestValidator({
  params: z.object({
    id: primaryKeySchema,
  }),
  body: z.object({
    title: z.optional(titleSchema),
    description: z.optional(descriptionSchema),
    categoryId: z.optional(primaryKeySchema),
    initialPublish: z.boolean().optional(),
    initialPrice: z
      .number({
        required_error: 'Початкова сума є обов’язковою',
        invalid_type_error: 'Невалідне значення початкової суми',
      })
      .min(1, {
        message: 'Початкова сума повинна бути більшою за 0',
      })
      .max(99999999.99, {
        message: 'Початкова сума дуже велика',
      })
      .optional(),
    initialDuration: z
      .enum(
        [
          lotInitialDurations.ONE_HOUR,
          lotInitialDurations.ONE_DAY,
          lotInitialDurations.THREE_DAYS,
          lotInitialDurations.SEVEN_DAYS,
        ],
        {
          required_error: 'Тривалість є обов’язковою',
          invalid_type_error: 'Невалідне значення тривалості',
        },
      )
      .optional(),
  }),
})
