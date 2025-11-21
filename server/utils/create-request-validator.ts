import type { H3Event } from 'h3'
import { z } from 'zod'

type ValidatorFunction<T = any> = (event: H3Event, context?: any) => Promise<T> | T
type ValidatorSchema<T = any> = z.ZodType<T>
type Validator<T = any> = ValidatorFunction<T> | ValidatorSchema<T>

interface ValidatorOptions {
  body?: Validator
  query?: Validator
  params?: Validator
  multipart?: Validator
}

type ValidatorResult<Options extends ValidatorOptions> = {
  [K in keyof Options]: K extends keyof Options ? ValidatorReturnType<NonNullable<Options[K]>> : never
}

/**
 * Returns the validated data from the validator.
 */
export type ValidatorReturnType<V>
  = V extends z.ZodType<infer T> ? T
    : V extends (event: H3Event, context?: any) => Promise<infer R> | infer R ? R
      : never

/**
 * Creates a request validator function.
 *
 * Options:
 *  - body: validates request body data
 *  - query: validates URL query parameters
 *  - params: validates route parameters
 *  - multipart: validates multipart form data
 *
 * Every option can be a Zod schema or a function that returns
 * the validated data.
 *
 * @param options - Options object
 * @returns validated data
 * @throws 422 error for validation failures
 * @throws 500 error for unexpected validation errors
 *
 * @example
 * const validator = createRequestValidator({
 *   body: z.object({ name: z.string() })
 * })
 * const Request = InferType<typeof validator>
 * const validatedData = await validator(event)
 */
export function createRequestValidator<Options extends ValidatorOptions>(
  options: Options,
) {
  return async (event: H3Event): Promise<ValidatorResult<Options>> => {
    try {
      const result = {} as any

      if (options.body) {
        if (typeof options.body === 'function') {
          result.body = await options.body(event)
        }
        else {
          result.body = options.body.parse(await readBody(event))
        }
      }

      if (options.query) {
        if (typeof options.query === 'function') {
          result.query = await options.query(event)
        }
        else {
          result.query = options.query.parse(getQuery(event))
        }
      }

      if (options.params) {
        if (typeof options.params === 'function') {
          result.params = await options.params(event)
        }
        else {
          result.params = options.params.parse(getRouterParams(event))
        }
      }

      if (options.multipart) {
        if (typeof options.multipart === 'function') {
          result.multipart = await options.multipart(event)
        }
        else {
          result.multipart = options.multipart.parse(await readMultipartFormData(event))
        }
      }

      return result
    }
    catch (error: any) {
      // For shema.parse(await readBody(event))
      if (error instanceof z.ZodError) {
        throw createError({
          statusCode: 422,
          statusMessage: 'Unprocessable Content',
          message: 'Неправильні дані запиту',
          data: z.flattenError(error),
        })
      }

      // For readValidatedBody(event, schema.parse)
      if (error.data instanceof z.ZodError) {
        throw createError({
          statusCode: 422,
          statusMessage: 'Unprocessable Content',
          message: 'Неправильні дані запиту',
          data: z.flattenError(error.data),
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
}
