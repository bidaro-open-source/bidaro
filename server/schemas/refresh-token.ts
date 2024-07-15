import { z } from 'zod'

export const refreshTokenSchema = z
  .string({
    required_error: 'Токен оновлення є обов\'язковим',
    invalid_type_error: 'Токен оновлення має бути рядком',
  })
  .uuid('Токен оновлення має бути дійсним')
