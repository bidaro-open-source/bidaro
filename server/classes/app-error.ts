import type { ErrorCode } from '../errors'
import { errors } from '../errors'

/**
 * Application error class that standardizes error handling
 *
 * This class wraps error definitions from errors.ts and provides
 * type-safe error creation with optional details
 */
export class AppError extends Error {
  /**
   * Error code from errors.ts
   */
  readonly code: ErrorCode

  /**
   * HTTP status code
   */
  readonly statusCode: number

  /**
   * Error title
   */
  readonly title: string

  /**
   * Error description
   */
  readonly description: string

  /**
   * Optional error details
   */
  readonly details?: unknown

  /**
   * Creates a new AppError instance
   *
   * @param code - Error code from errors.ts
   * @param details - Optional details object (validated against detailsSchema if defined)
   *
   * @example
   * throw new AppError('USER_NOT_FOUND', { userId: 123 })
   *
   * @example
   * throw new AppError('VALIDATION_ERROR', {
   *   fieldErrors: { email: ['Invalid email format'] }
   * })
   */
  constructor(code: ErrorCode, details?: unknown) {
    const errorDef = errors[code]

    super(errorDef.title)

    this.code = code
    this.statusCode = errorDef.statusCode
    this.title = errorDef.title
    this.description = errorDef.description

    // Validate details if schema is defined
    if (details !== undefined) {
      if (errorDef.detailsSchema) {
        try {
          this.details = errorDef.detailsSchema.parse(details)
        }
        catch (validationError) {
          // If validation fails, log warning but still include details
          // This prevents errors from being silently lost if details schema is incorrect
          logger.warn(`AppError details validation failed for ${code}: Schema mismatch for provided details`, {
            code,
            details,
            validationError,
          })
          this.details = details
        }
      }
      else {
        this.details = details
      }
    }

    // Maintain proper stack trace
    Error.captureStackTrace(this, this.constructor)
  }

  /**
   * Convert to JSON representation
   */
  toJSON() {
    return {
      code: this.code,
      title: this.title,
      description: this.description,
      details: this.details,
    }
  }
}
