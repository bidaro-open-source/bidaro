import type { ErrorCode } from '../errors'
import { errors } from '../errors'

/**
 * Creates a standardized application error using Nitro's createError
 *
 * This utility wraps h3's createError to provide type-safe error creation
 * with centralized error definitions. The response structure {code, title, description, details}
 * is placed in the data field for compatibility with Nitro error handling.
 *
 * @param code - Error code from errors.ts
 * @param details - Optional details object (validated against detailsSchema if defined)
 * @returns H3Error with standardized error data
 *
 * @example
 * throw createAppError('USER_NOT_FOUND', { userId: 123 })
 *
 * @example
 * throw createAppError('VALIDATION_ERROR', {
 *   fieldErrors: { email: ['Invalid email format'] }
 * })
 */
export function createAppError(code: ErrorCode, details?: unknown) {
  const errorDef = errors[code]

  let validatedDetails = details

  if (details !== undefined && errorDef.detailsSchema) {
    try {
      validatedDetails = errorDef.detailsSchema.parse(details)
    }
    catch (validationError) {
      logger.warn(`createAppError details validation failed for ${code}: Schema mismatch for provided details`, {
        code,
        details,
        validationError,
      })
      validatedDetails = details
    }
  }

  return createError({
    statusCode: errorDef.statusCode,
    statusMessage: errorDef.title,
    data: {
      code,
      title: errorDef.title,
      description: errorDef.description,
      ...(validatedDetails !== undefined && { details: validatedDetails }),
    },
  })
}
