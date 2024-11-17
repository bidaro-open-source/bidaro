import type { Database } from '../database'
import process from 'node:process'
import { Sequelize } from 'sequelize'
import { BootstrapDatabase } from '../database'

let db: Database | undefined

/**
 * Returns Sequelize ORM instance.
 *
 * @param event H3Event
 * @returns sequelize instance
 * @throws if connection is not success
 */
export default function (event?: H3Event): Database {
  try {
    if (!db) {
      const runtimeConfig = useRuntimeConfig(event)

      db = BootstrapDatabase(
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

    return db
  }
  catch (e) {
    throw new Error(`Database is not connected.`)
  }
}
