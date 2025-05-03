import { z } from 'zod'

/**
 * Represents the structure of request data that can be validated.
 */
export interface RequestData {
  body?: unknown
  query?: unknown
  params?: unknown
  multipart?: unknown
}

/**
 * Function signature for request validation.
 */
export interface RequestValidator<T> {
  (event: H3Event): Promise<T>
}

/**
 * Validates request data using the provided validator function.
 *
 * Handles validation errors gracefully by converting Zod errors into
 * formatted HTTP 422 errors.
 *
 * @param event - H3Event
 * @param validator - A function that validates the request data
 * @returns A promise containing the validated request data
 * @throws Formatted HTTP 422 error if validation fails with Zod errors
 * @throws Original error if any other error occurs
 *
 * @example
 * // Define a validator using Zod
 * const createUserValidator: RequestValidator = async (event) => {
 *   const body = await readBody(event)
 *   return { body: createUserSchema.parse(body) }
 * }
 *
 * // Use in your API route handler
 * export default defineEventHandler(async (event) => {
 *   const { body } = await validateRequest(event, createUserValidator)
 *   // body is now type-safe and validated
 *   return await createUser(body)
 * })
 */
export async function validateRequest<T extends RequestData>(
  event: H3Event,
  validator: RequestValidator<T>,
): Promise<T> {
  try {
    return await validator(event)
  }
  catch (error: any) {
    if (error?.data instanceof z.ZodError) {
      throw createError({
        statusCode: 422,
        statusMessage: 'Unprocessable Content',
        message: 'Неправильні дані запиту',
        data: error.data.flatten(),
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Unprocessable Content',
      message: 'Невідома помилка під час валідації запиту',
      data: error,
    })
  }
}
