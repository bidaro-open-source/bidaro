export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', (error: Error, { event }) => {
    let errorData: { code: string, title: string, description: string, details?: unknown } | null = null
    let statusCode: number | undefined

    if (error && typeof error === 'object' && 'data' in error) {
      const data = (error as any).data
      if (data && typeof data === 'object' && 'code' in data) {
        errorData = data as { code: string, title: string, description: string, details?: unknown }
        statusCode = (error as any).statusCode
      }
    }

    if (!errorData && error.cause && typeof error.cause === 'object' && 'data' in error.cause) {
      const causeData = (error.cause as any).data
      if (causeData && typeof causeData === 'object' && 'code' in causeData) {
        errorData = causeData as { code: string, title: string, description: string, details?: unknown }
        statusCode = (error.cause as any).statusCode
      }
    }

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
      logger.error('Unexpected error', {
        error,
        message: error.message,
        stack: error.stack,
        url: event?.path,
        method: event?.method,
      })
    }
  })
})
