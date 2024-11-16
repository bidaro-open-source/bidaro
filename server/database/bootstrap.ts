import type { Sequelize } from 'sequelize'
import type {
  Database,
  DatabaseOptional,
  DatabaseWithFactories,
  DatabaseWithFactoriesOptional,
} from './types.js'
import { InitializeUserFactroy } from './factories/UserFactory'
import { InitializeUser } from './models/User'

/**
 * Bootstrap database.
 *
 * @param sequelize sequelize instance
 * @returns database object with models
 */
export function BootstrapDatabase(sequelize: Sequelize): Database {
  const database: DatabaseOptional = { sequelize }

  database.User = InitializeUser(database)

  for (const key in database) {
    const Model = database[key as keyof typeof database]
    if (Model && Object.hasOwn(Model, 'associate')) {
      // @ts-expect-error hasOwn issue
      Model.associate(database)
    }
  }

  return database as Database
}

/**
 * Bootstrap factories.
 *
 * @param database database with models
 * @returns database object with factories
 */
export function BootstrapFactories(
  database: Database,
): DatabaseWithFactories {
  const databaseWithFactories: DatabaseWithFactoriesOptional = database

  databaseWithFactories.UserFactory = InitializeUserFactroy(database.User)

  return databaseWithFactories as DatabaseWithFactories
}
