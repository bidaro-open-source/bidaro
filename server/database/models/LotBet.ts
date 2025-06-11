import type {
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  CreationOptional,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
} from 'sequelize'
import type { MakeNullishOptional } from 'sequelize/lib/utils'
import type { Database, DatabaseOptional } from '../types'
import type { Lot } from './Lot'
import type { User } from './User'
import { DataTypes, Model } from 'sequelize'

export type LotBetModel = typeof LotBet
export type LotBetAttributes = InferAttributes<LotBet>
export type LotBetCreationAttributes = InferCreationAttributes<LotBet>
export type LotBetAttributesOptional = MakeNullishOptional<LotBetCreationAttributes>

export class LotBet extends Model<LotBetAttributes, LotBetCreationAttributes> {
  declare id: CreationOptional<number>
  declare lotId: ForeignKey<Lot['id']>
  declare userId: ForeignKey<User['id']>
  declare amount: number
  declare createdAt: CreationOptional<Date>

  declare lot?: NonAttribute<Lot>
  declare getLot: BelongsToGetAssociationMixin<Lot>
  declare setLot: BelongsToSetAssociationMixin<Lot, number>

  declare user?: NonAttribute<User>
  declare getUser: BelongsToGetAssociationMixin<User>
  declare setUser: BelongsToSetAssociationMixin<User, number>

  static associate(database: Database) {
    database.LotBet.belongsTo(database.Lot, {
      as: 'lot',
      foreignKey: 'lotId',
    })

    database.LotBet.belongsTo(database.User, {
      as: 'user',
      foreignKey: 'userId',
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
        get() {
          // @ts-expect-error sequelize issue #8019
          const value: string = this.getDataValue('amount')
          return value === null ? null : parseFloat(value)
        },
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
