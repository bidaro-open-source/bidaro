import type { H3Event } from 'h3'
import { AppError } from '#classes/app-error'
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
        throw new AppError('VALIDATION_ERROR', {
          fieldErrors: z.flattenError(error).fieldErrors,
          formErrors: z.flattenError(error).formErrors,
        })
      }

      if (error.data instanceof z.ZodError) {
        throw new AppError('VALIDATION_ERROR', {
          fieldErrors: z.flattenError(error.data).fieldErrors,
          formErrors: z.flattenError(error.data).formErrors,
        })
      }

      if (error instanceof AppError) {
        throw error
      }

      throw new AppError('UNKNOWN_VALIDATION_ERROR')
    }
  }
}
