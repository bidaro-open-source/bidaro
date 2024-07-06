import type { H3Event } from 'h3'
import { Sequelize } from 'sequelize'
import { UserFactory } from '../database'

interface Database {
  sequelize?: Sequelize
  User?: ReturnType<typeof UserFactory>
}

const db: Database = {}

/**
 * Returns Sequelize ORM instance.
 *
 * @param event H3Event
 * @returns sequelize instance
 * @throws if connection is not success
 */
export default function (event?: H3Event): Required<Database> {
  try {
    const runtimeConfig = useRuntimeConfig(event)

    if (!db.sequelize) {
      db.sequelize = new Sequelize({
        host: runtimeConfig.db.host,
        port: +runtimeConfig.db.port,
        database: runtimeConfig.db.database,
        username: runtimeConfig.db.username,
        password: runtimeConfig.db.password,
        dialect: runtimeConfig.db.connection as any,
      })

      db.User = UserFactory(db.sequelize)
    }

    db.sequelize.authenticate()

    return db as Required<Database>
  }
  catch (e) {
    throw new Error('Database is not connected.')
  }
}