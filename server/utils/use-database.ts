import type { Database } from '#database'
import { BootstrapDatabase } from '#database'
import { Sequelize } from 'sequelize'

/**
 * Singleton instance of the Database.
 */
let database: Database | undefined

/**
 * Returns a singleton Sequelize ORM database instance.
 *
 * @param event H3Event
 * @returns A configured Database instance with all models initialized
 *
 * @example
 * // Use in API route handler
 * export default defineEventHandler(async (event) => {
 *   const db = useDatabase(event)
 *   const users = await db.User.findAll()
 *   return { users }
 * })
 */
export function useDatabase(event?: H3Event): Database {
  try {
    if (!database) {
      const runtimeConfig = useRuntimeConfig(event)

      database = BootstrapDatabase(
        new Sequelize({
          host: runtimeConfig.db.host,
          port: +runtimeConfig.db.port,
          database: runtimeConfig.db.database,
          username: runtimeConfig.db.username,
          password: runtimeConfig.db.password,
          dialect: runtimeConfig.db.connection as any,
          logging: false,
        }),
      )
    }

    return database
  }
  catch (error) {
    logger.error('Failed to create database connection', error)
    throw createAppError('INTERNAL_SERVER_ERROR')
  }
}
