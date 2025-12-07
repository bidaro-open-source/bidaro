import type { H3Error } from 'h3'
import { AppError } from '#classes/app-error'

/**
 * Error handler plugin that standardizes error responses
 *
 * This plugin handles the 'error' hook and outputs standardized error schemas:
 * - For AppError instances: { code, title, description, details }
 * - For other errors: status 500 with INTERNAL_SERVER_ERROR definition
 *
 * All 500 errors are logged with logger.error
 */
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', (error, { event }) => {
    // Handle AppError instances
    if (error instanceof AppError) {
      // Log 500 errors
      if (error.statusCode >= 500) {
        logger.error(`AppError: ${error.code}`, {
          code: error.code,
          statusCode: error.statusCode,
          details: error.details,
          stack: error.stack,
          url: event?.path,
          method: event?.method,
        })
      }

      // Set response status and body
      if (event) {
        setResponseStatus(event, error.statusCode)
        return error.toJSON()
      }
    }

    // Handle H3Error (createError compatibility during transition)
    if (isError(error) && 'statusCode' in error) {
      const h3Error = error as H3Error

      // Log all 500-level errors
      if (h3Error.statusCode >= 500) {
        logger.error('H3Error', {
          message: h3Error.message,
          statusCode: h3Error.statusCode,
          statusMessage: h3Error.statusMessage,
          data: h3Error.data,
          stack: h3Error.stack,
          url: event?.path,
          method: event?.method,
        })
      }

      // Return H3Error as-is for now (backward compatibility)
      if (event) {
        setResponseStatus(event, h3Error.statusCode)
      }

      return
    }

    // Handle all other errors as 500 Internal Server Error
    logger.error('Unexpected error', {
      error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      url: event?.path,
      method: event?.method,
    })

    if (event) {
      setResponseStatus(event, 500)
      return {
        code: 'INTERNAL_SERVER_ERROR',
        title: 'Внутрішня помилка сервера',
        description: 'Виникла непередбачена помилка на сервері. Спробуйте пізніше або зв\'яжіться з підтримкою.',
      }
    }
  })
})

/**
 * Type guard to check if value is an Error
 */
function isError(error: unknown): error is Error {
  return error instanceof Error
}
