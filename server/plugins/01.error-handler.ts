import { AppError } from '#classes/app-error'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', (error, { event }) => {
    if (error instanceof AppError) {
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

      if (event) {
        setResponseStatus(event, error.statusCode)
        return error.toJSON()
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
