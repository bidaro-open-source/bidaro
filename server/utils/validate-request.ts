import { z } from 'zod'

export interface RequestData {
  body?: unknown
  query?: unknown
  params?: unknown
  multipart?: unknown
}

export interface RequestValidator<T> {
  (event: H3Event): Promise<T>
}

export default async function<T extends RequestData>(
  event: H3Event,
  validator: RequestValidator<T>,
): Promise<T> {
  try {
    return await validator(event)
  }
  catch (error: any) {
    if (error?.data instanceof z.ZodError) {
      throw createError({
        status: 422,
        message: 'Неправильні дані запиту',
        data: error.data.flatten(),
      })
    }

    throw error
  }
}
