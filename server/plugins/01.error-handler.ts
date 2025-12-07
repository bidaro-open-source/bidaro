export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', (error: Error, { event }) => {
    // Try to find error data from createAppError
    // It can be in error.data or in error.cause.data
    let errorData: { code: string, title: string, description: string, details?: unknown } | null = null
    let statusCode: number | undefined

    // Check if error has data property (direct createError result)
    if (error && typeof error === 'object' && 'data' in error) {
      const data = (error as any).data
      if (data && typeof data === 'object' && 'code' in data) {
        errorData = data as { code: string, title: string, description: string, details?: unknown }
        statusCode = (error as any).statusCode
      }
    }

    // Check if error has cause property with createError result
    if (!errorData && error.cause && typeof error.cause === 'object' && 'data' in error.cause) {
      const causeData = (error.cause as any).data
      if (causeData && typeof causeData === 'object' && 'code' in causeData) {
        errorData = causeData as { code: string, title: string, description: string, details?: unknown }
        statusCode = (error.cause as any).statusCode
      }
    }

    // If we found error data from createAppError, log 500+ errors
    if (errorData) {
      if (statusCode && statusCode >= 500) {
        logger.error(`AppError: ${errorData.code}`, {
          code: errorData.code,
          statusCode,
          details: errorData.details,
          stack: error.stack,
          url: event?.path,
          method: event?.method,
        })
      }
    }
    else {
      // Log all unexpected errors
      logger.error('Unexpected error', {
        error,
        message: error.message,
        stack: error.stack,
        url: event?.path,
        method: event?.method,
      })
    }

    // Do not return anything - Nitro handles response formatting
  })
})
