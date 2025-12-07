export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', (error, { event }) => {
    // Check if this is an error created by createAppError
    if (error.data && typeof error.data === 'object' && 'code' in error.data) {
      const errorData = error.data as { code: string, title: string, description: string, details?: unknown }

      if (error.statusCode && error.statusCode >= 500) {
        logger.error(`AppError: ${errorData.code}`, {
          code: errorData.code,
          statusCode: error.statusCode,
          details: errorData.details,
          stack: error.stack,
          url: event?.path,
          method: event?.method,
        })
      }

      if (event) {
        setResponseStatus(event, error.statusCode || 500)
        return errorData
      }
    }

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
