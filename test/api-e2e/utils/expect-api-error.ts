import type { FetchResponse } from 'ofetch'
import type { ErrorCode } from '~~/server/errors'
import { expect } from 'vitest'
import { errors } from '~~/server/errors'

/**
 * Assert that an API response contains the expected error with correct structure
 *
 * @param response - The API response object from ofetch
 * @param errorCode - The expected error code (must be a valid key from errors.ts)
 *
 * @example
 * ```ts
 * const response = await request({ ... })
 * expectApiError(response, 'USER_NOT_FOUND')
 * ```
 */
export function expectApiError(
  response: FetchResponse<any>,
  errorCode: ErrorCode,
): void {
  const errorDefinition = errors[errorCode]

  expect(response.status).toBe(errorDefinition.statusCode)
  expect(response._data?.data?.code).toBe(errorCode)
  expect(response._data?.data?.message).toBe(errorDefinition.message)
  expect(response._data?.data?.description).toBe(errorDefinition.description)
}
