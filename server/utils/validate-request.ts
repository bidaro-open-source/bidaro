import { z } from 'zod'

/**
 * Request data of validator
 */
export interface RequestData {
  body?: unknown
  query?: unknown
  params?: unknown
  multipart?: unknown
}

/**
 * Request validator policy function
 */
export interface RequestValidator<T> {
  (event: H3Event): Promise<T>
}

/**
 * Validate request data and return it
 *
 * @param event H3Event
 * @returns validated request data
 */
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
