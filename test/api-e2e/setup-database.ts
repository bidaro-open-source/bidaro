import { env } from 'node:process'
import { BootstrapDatabase, BootstrapFactories } from '#database'
import { Sequelize } from 'sequelize'
import { afterAll, beforeAll } from 'vitest'

async function useDatabase() {
  try {
    const connection = new Sequelize({
      host: env.DB_HOST,
      port: +(env.DB_PORT || ''),
      database: env.DB_DATABASE,
      username: env.DB_USERNAME,
      password: env.DB_PASSWORD,
      dialect: env.DB_CONNECTION as any,
      logging: false,
    })

    await connection.authenticate()

    return BootstrapFactories(
      BootstrapDatabase(connection),
    )
  }
  catch (e) {
    throw new Error(`Database is not connected. Error: ${e}`)
  }
}

beforeAll(async () => {
  // @ts-expect-error type
  globalThis.db = await useDatabase()
})

afterAll(async () => {
  // @ts-expect-error type
  await globalThis.db.sequelize.close()
  // @ts-expect-error type
  delete globalThis.db
})

declare global {
  let db: Awaited<ReturnType<typeof useDatabase>>
}
