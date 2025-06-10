import type {
  HasManyAddAssociationMixin,
  HasManyAddAssociationsMixin,
  HasManyCountAssociationsMixin,
  HasManyGetAssociationsMixin,
  HasManyHasAssociationMixin,
  HasManyHasAssociationsMixin,
  HasManyRemoveAssociationMixin,
  HasManyRemoveAssociationsMixin,
  HasManySetAssociationsMixin,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
} from 'sequelize'
import type { Database, DatabaseOptional } from '../types'
import type { Lot } from './Lot'
import { DataTypes, Model } from 'sequelize'

export type LotStatusModel = typeof LotStatus
export type LotStatusAttributes = InferAttributes<LotStatus>
export type LotStatusCreationAttributes = InferCreationAttributes<LotStatus>

export class LotStatus extends Model<LotStatusAttributes, LotStatusCreationAttributes> {
  declare name: string

  // Lots associations
  declare lots?: NonAttribute<Lot[]>
  declare getLots: HasManyGetAssociationsMixin<Lot>
  declare addLot: HasManyAddAssociationMixin<Lot, number>
  declare addLots: HasManyAddAssociationsMixin<Lot, number>
  declare setLots: HasManySetAssociationsMixin<Lot, number>
  declare removeLot: HasManyRemoveAssociationMixin<Lot, number>
  declare removeLots: HasManyRemoveAssociationsMixin<Lot, number>
  declare hasLot: HasManyHasAssociationMixin<Lot, string>
  declare hasLots: HasManyHasAssociationsMixin<Lot, number>
  declare countLots: HasManyCountAssociationsMixin

  static associate(database: Database) {
    database.LotStatus.hasMany(database.Lot, {
      as: 'lots',
      foreignKey: 'statusName',
    })
  }
}

export function InitializeLotStatus(database: DatabaseOptional) {
  LotStatus.init(
    {
      name: {
        type: DataTypes.STRING(32),
        unique: true,
        primaryKey: true,
        allowNull: false,
      },
    },
    {
      sequelize: database.sequelize,
      modelName: 'LotStatus',
      tableName: 'lot_statuses',
      timestamps: false,
    },
  )

  return LotStatus
}
