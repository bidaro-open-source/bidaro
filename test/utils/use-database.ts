import { env } from 'node:process'
import { Sequelize } from 'sequelize'
import { InitializeUserFactroy } from './factories'
import { InitializeUser } from '~/server/models'

interface Database {
  sequelize?: Sequelize
  User?: ReturnType<typeof InitializeUser>
  UserFactory?: ReturnType<typeof InitializeUserFactroy>
}

export function useDatabase() {
  try {
    const db: Database = {}

    db.sequelize = new Sequelize({
      host: env.NUXT_DB_HOST,
      port: +(env.NUXT_DB_PORT || ''),
      database: env.NUXT_DB_DATABASE,
      username: env.NUXT_DB_USERNAME,
      password: env.NUXT_DB_PASSWORD,
      dialect: env.NUXT_DB_CONNECTION as any,
      logging: false,
    })

    db.User = InitializeUser(db.sequelize)
    db.UserFactory = InitializeUserFactroy(db.User)

    return db as Required<Database>
  }
  catch (e) {
    throw new Error('Database is not connected.')
  }
}
