import type { Database } from '~/server/database'
import { env } from 'node:process'
import { Sequelize } from 'sequelize'
import { afterAll, beforeAll } from 'vitest'
import {
  BootstrapDatabase,
  BootstrapFactories,
} from '~/server/database'

function useDatabase() {
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

    connection.authenticate()

    const database: Database = BootstrapDatabase(connection)

    return BootstrapFactories(database)
  }
  catch (e) {
    throw new Error(`Database is not connected. Error: ${e}`)
  }
}

beforeAll(() => {
  // @ts-expect-error type
  globalThis.db = useDatabase()
})

afterAll(async () => {
  // @ts-expect-error type
  await globalThis.db.sequelize.close()
  // @ts-expect-error type
  delete globalThis.db
})

declare global {
  let db: ReturnType<typeof useDatabase>
}
