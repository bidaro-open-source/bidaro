import type {
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  CreationOptional,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
} from 'sequelize'
import type { Database, DatabaseOptional } from '../types'
import type { Lot } from './Lot'
import type { User } from './User'
import {
  DataTypes,
  Model,
} from 'sequelize'

export class LotBet extends Model<InferAttributes<LotBet>, InferCreationAttributes<LotBet>> {
  declare id: CreationOptional<number>
  declare lotId: ForeignKey<Lot['id']>
  declare userId: ForeignKey<User['id']>
  declare amount: number
  declare createdAt: CreationOptional<Date>

  // User association
  declare user?: NonAttribute<User>
  declare getUser: BelongsToGetAssociationMixin<User>
  declare setUser: BelongsToSetAssociationMixin<User, number>

  // Lot association
  declare lot?: NonAttribute<Lot>
  declare getLot: BelongsToGetAssociationMixin<Lot>
  declare setLot: BelongsToSetAssociationMixin<Lot, number>

  static associate(database: Database) {
    database.LotBet.belongsTo(database.User, {
      as: 'user',
      foreignKey: 'userId',
    })

    database.LotBet.belongsTo(database.Lot, {
      as: 'lot',
      foreignKey: 'lotId',
    })
  }
}

export function InitializeLotBet(database: DatabaseOptional) {
  LotBet.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      lotId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize: database.sequelize,
      modelName: 'LotBet',
      tableName: 'lot_bets',
      timestamps: false,
    },
  )

  return LotBet
}
