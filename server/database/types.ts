import type { Sequelize } from 'sequelize'
import type { InitializeRoleFactroy } from './factories/RoleFactory'
import type { InitializeUserFactroy } from './factories/UserFactory'
import type { InitializePermission } from './models/Permission'
import type { InitializeRole } from './models/Role'
import type { InitializeUser } from './models/User'

export interface DatabaseModels {
  Permission: ReturnType<typeof InitializePermission>
  Role: ReturnType<typeof InitializeRole>
  User: ReturnType<typeof InitializeUser>
}

export interface DatabaseFactories {
  RoleFactory: ReturnType<typeof InitializeRoleFactroy>
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
