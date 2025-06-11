import { z } from 'zod'
import {
  descriptionSchema,
  titleSchema,
} from '~~/server/zod/models/lot'
import { primaryKeySchema } from '~~/server/zod/primary-key'

export type UpdateLotRequest = ValidatorReturnType<typeof updateLotRequest>
export const updateLotRequest = createRequestValidator({
  params: z.object({
    id: primaryKeySchema,
  }),
  body: z.object({
    title: z.optional(titleSchema),
    description: z.optional(descriptionSchema),
    initialPublish: z.boolean().optional(),
    initialAmount: z
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
        ['1_hour', '1_day', '3_days', '7_days'],
        {
          required_error: 'Тривалість є обов’язковою',
          invalid_type_error: 'Невалідне значення тривалості',
        },
      )
      .optional(),
  }),
})
