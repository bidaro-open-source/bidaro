import type { Sequelize } from 'sequelize'
import type {
  Database,
  DatabaseOptional,
  DatabaseWithFactories,
  DatabaseWithFactoriesOptional,
} from './types.js'
import { InitializeRoleFactroy } from './factories/RoleFactory.js'
import { InitializeUserFactroy } from './factories/UserFactory'
import { InitializePermission } from './models/Permission'
import { InitializeRole } from './models/Role'
import { InitializeUser } from './models/User'

/**
 * Bootstrap database.
 *
 * @param sequelize sequelize instance
 * @returns database object with models
 */
export function BootstrapDatabase(sequelize: Sequelize): Database {
  const database: DatabaseOptional = { sequelize }

  database.Permission = InitializePermission(database)
  database.Role = InitializeRole(database)
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

  databaseWithFactories.RoleFactory = InitializeRoleFactroy(database.Role)
  databaseWithFactories.UserFactory = InitializeUserFactroy(database.User)

  return databaseWithFactories as DatabaseWithFactories
}
