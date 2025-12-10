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

export type ValidatorReturnType<V>
  = V extends z.ZodType<infer T> ? T
    : V extends (event: H3Event, context?: any) => Promise<infer R> | infer R ? R
      : never

/**
 * Creates a request validator function.
 *
 * Validates request data (body, query, params, multipart) using Zod schemas or custom functions.
 *
 * @param options - Validation options for different request parts
 * @returns Async function that validates the request and returns validated data
 * @throws VALIDATION_ERROR
 *
 * @example
 * const validator = createRequestValidator({
 *   body: z.object({ name: z.string() })
 * })
 * const { body } = await validator(event)
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
      if (error instanceof z.ZodError) {
        const flattened = z.flattenError(error)
        throw createAppError('VALIDATION_ERROR', {
          fieldErrors: flattened.fieldErrors,
          formErrors: flattened.formErrors,
        })
      }

      if (error.data instanceof z.ZodError) {
        const flattened = z.flattenError(error.data)
        throw createAppError('VALIDATION_ERROR', {
          fieldErrors: flattened.fieldErrors,
          formErrors: flattened.formErrors,
        })
      }

      // For createError({ ... })
      if (typeof error?.statusCode === 'number') {
        throw error
      }

      logger.crit('Unknown error during request validation', error)

      throw createAppError('INTERNAL_SERVER_ERROR')
    }
  }
}
