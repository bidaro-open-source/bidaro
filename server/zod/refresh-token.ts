import { z } from 'zod'

export const refreshTokenSchema = z
  .string({
    error: issue => issue.input === undefined
      ? 'Токен оновлення є обов\'язковим'
      : 'Токен оновлення має бути рядком',

  })
  .min(1, { error: 'Токен оновлення не може бути порожнім' })
