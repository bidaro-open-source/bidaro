import { z } from 'zod'
import { primaryKeySchema } from '~~/server/zod/primary-key'

export type CreateLotBetRequest = ValidatorReturnType<typeof createLotBetRequest>
export const createLotBetRequest = createRequestValidator({
  params: z.object({
    id: primaryKeySchema,
  }),
  body: z.object({
    amount: z
      .number({
        required_error: 'Сума є обов’язковою',
        invalid_type_error: 'Невалідна сума',
      })
      .min(1, 'Сума має бути більшою за 0')
      .max(99999999.99, {
        message: 'Сума дуже велика',
      }),
  }),
})
