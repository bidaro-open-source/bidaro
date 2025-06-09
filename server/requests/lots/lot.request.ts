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
