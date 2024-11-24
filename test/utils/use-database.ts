import { env } from 'node:process'
import { Sequelize } from 'sequelize'
import {
  BootstrapDatabase,
  BootstrapFactories,
} from '~/server/database'
import type { Database } from '~/server/database'

export function useDatabase() {
  try {
    const connection = new Sequelize({
      host: env.NUXT_DB_HOST,
      port: +(env.NUXT_DB_PORT || ''),
      database: env.NUXT_DB_DATABASE,
      username: env.NUXT_DB_USERNAME,
      password: env.NUXT_DB_PASSWORD,
      dialect: env.NUXT_DB_CONNECTION as any,
      logging: false,
    })

    const database: Database = BootstrapDatabase(connection)

    return BootstrapFactories(database)
  }
  catch (e) {
    throw new Error(`Database is not connected. Error: ${e}`)
  }
}
