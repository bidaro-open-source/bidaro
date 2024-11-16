import type { Sequelize } from 'sequelize'
import type { InitializeUserFactroy } from './factories/UserFactory'
import type { InitializeUser } from './models/User'

export interface DatabaseModels {
  User: ReturnType<typeof InitializeUser>
}

export interface DatabaseFactories {
  UserFactory: ReturnType<typeof InitializeUserFactroy>
}

export interface DatabaseOptional extends Partial<DatabaseModels> {
  sequelize: Sequelize
}

export interface Database extends DatabaseModels {
  sequelize: Sequelize
}

export interface DatabaseWithFactories extends Database, DatabaseFactories {}

export interface DatabaseWithFactoriesOptional
  extends Database, Partial<DatabaseFactories> {}
