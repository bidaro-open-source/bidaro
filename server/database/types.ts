import type { Sequelize } from 'sequelize'

import type { factories } from './factories'
import type { models } from './models'

export type Models = typeof models

export type Factories = typeof factories

export type DatabaseModels = {
  -readonly [K in keyof Models]: ReturnType<Models[K]>;
}

export type DatabaseFactories = {
  -readonly [K in keyof Factories]: ReturnType<Factories[K]>;
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
