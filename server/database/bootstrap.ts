import type { Sequelize } from 'sequelize'
import type {
  Database,
  DatabaseOptional,
  DatabaseWithFactories,
  DatabaseWithFactoriesOptional,
} from './types'

import { factories } from './factories'
import { models } from './models'

/**
 * Bootstrap database. Import all models and associate them.
 *
 * @param sequelize sequelize instance
 * @returns database object with models
 */
export function BootstrapDatabase(sequelize: Sequelize): Database {
  const database: DatabaseOptional = { sequelize }

  for (const key in models) {
    // @ts-expect-error typescript error
    database[key] = models[key](database)
  }

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
 * Bootstrap factories. Import all factories and associate them
 * with the database.
 *
 * @param database database with models
 * @returns database object with factories
 */
export function BootstrapFactories(
  database: Database,
): DatabaseWithFactories {
  const databaseWithFactories: DatabaseWithFactoriesOptional = database

  for (const key in factories) {
    // @ts-expect-error typescript error
    databaseWithFactories[key] = factories[key](databaseWithFactories)
  }

  return databaseWithFactories as DatabaseWithFactories
}
