import { expect } from 'vitest'
import { errors, type ErrorCode } from '#errors'

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
  response: { status: number, _data: { data: { code: string, message: string, description: string } } },
  errorCode: ErrorCode,
): void {
  const errorDefinition = errors[errorCode]

  expect(response.status).toBe(errorDefinition.statusCode)
  expect(response._data.data.code).toBe(errorCode)
  expect(response._data.data.message).toBe(errorDefinition.title)
  expect(response._data.data.description).toBe(errorDefinition.description)
}
