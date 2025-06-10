import { z } from 'zod'
import {
  descriptionSchema,
  titleSchema,
} from '~~/server/zod/models/lot'
import { primaryKeySchema } from '~~/server/zod/primary-key'

export type GetLotRequest = ValidatorReturnType<typeof getLotRequest>
export const getLotRequest = createRequestValidator({
  params: z.object({
    id: primaryKeySchema,
  }),
})

export type CreateLotRequest = ValidatorReturnType<typeof createLotRequest>
export const createLotRequest = createRequestValidator({
  body: z.object({
    title: titleSchema,
    description: z.optional(descriptionSchema),
    duration: z.enum(['1_hour', '1_day', '3_days', '7_days'], {
      required_error: 'Тривалість є обов’язковою',
      invalid_type_error: 'Невалідне значення тривалості',
    }),
    initialAmount: z.number({
      required_error: 'Початкова сума є обов’язковою',
      invalid_type_error: 'Невалідне значення початкової суми',
    }).min(1, {
      message: 'Початкова сума має бути більшою за 0',
    }),
    immediatelyPublish: z.boolean(),
  }),
})

export type UpdateLotRequest = ValidatorReturnType<typeof updateLotRequest>
export const updateLotRequest = createRequestValidator({
  params: z.object({
    id: primaryKeySchema,
  }),
  body: z.object({
    title: z.optional(titleSchema),
    description: z.optional(descriptionSchema),
    initialAmount: z.optional(z.number({
      required_error: 'Початкова сума є обов’язковою',
      invalid_type_error: 'Невалідне значення початкової суми',
    }).min(1, {
      message: 'Початкова сума має бути більшою за 0',
    })),
    duration: z.enum(['1_hour', '1_day', '3_days', '7_days'], {
      invalid_type_error: 'Невалідне значення тривалості',
    }).optional(),
    immediatelyPublish: z.boolean(),
  }),
})

export type DeleteLotRequest = ValidatorReturnType<typeof deleteLotRequest>
export const deleteLotRequest = createRequestValidator({
  params: z.object({
    id: primaryKeySchema,
  }),
})

export type PublishLotRequest = ValidatorReturnType<typeof publishLotRequest>
export const publishLotRequest = createRequestValidator({
  params: z.object({
    id: primaryKeySchema,
  }),
})

export type ShipLotRequest = ValidatorReturnType<typeof shipLotRequest>
export const shipLotRequest = createRequestValidator({
  params: z.object({
    id: primaryKeySchema,
  }),
})

export type BetLotRequest = ValidatorReturnType<typeof betLotRequest>
export const betLotRequest = createRequestValidator({
  params: z.object({
    id: primaryKeySchema,
  }),
  body: z.object({
    amount: z
      .number({
        required_error: 'Сума є обов’язковою',
        invalid_type_error: 'Невалідна сума',
      })
      .min(1, 'Сума має бути більшою за 0'),
  }),
})
