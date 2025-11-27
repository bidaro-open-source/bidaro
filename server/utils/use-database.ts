import type { Database } from '#database'
import process from 'node:process'
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
 * @throws Error if database connection cannot be established
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
          logging: process.env.NODE_ENV === 'development',
        }),
      )
    }

    return database
  }
  catch (e) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Database connection failed',
      data: e,
    })
  }
}
