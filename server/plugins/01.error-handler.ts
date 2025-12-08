import { H3Error } from 'h3'

/**
 * Nitro plugin to handle and log server errors.
 * Differentiates between operational errors and unexpected errors.
 */
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', async (error, { event }) => {
    if (!event) {
      return
    }

    if (error instanceof H3Error && error.statusCode >= 500 && error.data?.code) {
      logger.error(`Operational Server Error: ${error.data.code}`, {
        details: error.data.details,
        path: event.path,
        method: event.method,
      })
    }
    else if (error instanceof H3Error && error.statusCode >= 500) {
      logger.error(`Unexpected H3Error`, {
        error,
        path: event.path,
        method: event.method,
      })
    }
    else if (error instanceof H3Error && error.statusCode < 500) {
      // Noop for operational client errors
    }
    else {
      logger.error(`Unexpected Error`, {
        error,
        path: event.path,
        method: event.method,
      })
    }
  })
})
