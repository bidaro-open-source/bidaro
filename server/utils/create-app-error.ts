import type { ErrorCode, ErrorDefinition, ErrorDetails } from '~~/server/errors'
import { errors } from '~~/server/errors'

/**
 * Creates a strongly-typed AppError instance.
 * Validates the provided details against the Zod schema defined in the registry.
 *
 * @param code - The error code from the registry.
 * @param details - The payload required by the error's schema (if any).
 * @returns An instance of AppError ready to be thrown.
 */
export function createAppError<T extends ErrorCode>(code: T, details?: ErrorDetails<T>) {
  const definition = errors[code] as ErrorDefinition

  let validDetails = details

  if (definition.detailsSchema) {
    const parseResult = definition.detailsSchema.safeParse(details || {})

    if (!parseResult.success) {
      logger.error(`[AppError] Schema Mismatch for code: ${code}`, {
        code,
        providedDetails: details,
        zodErrors: parseResult.error,
      })

      validDetails = details as any
    }
  }

  return createError({
    statusCode: definition.statusCode,
    data: {
      code,
      title: definition.title,
      description: definition.description,
      details: validDetails || undefined,
    },
  })
}
