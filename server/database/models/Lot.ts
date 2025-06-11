import type {
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  CreationOptional,
  ForeignKey,
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
import type { MakeNullishOptional } from 'sequelize/lib/utils'
import type { Database, DatabaseOptional } from '../types'
import type { LotBet } from './LotBet'
import type { LotStatus } from './LotStatus'
import type { User } from './User'
import { DataTypes, Model } from 'sequelize'

export type LotModel = typeof Lot
export type LotAttributes = InferAttributes<Lot>
export type LotCreationAttributes = InferCreationAttributes<Lot>
export type LotAttributesOptional = MakeNullishOptional<LotCreationAttributes>

export class Lot extends Model<LotAttributes, LotCreationAttributes> {
  declare id: CreationOptional<number>
  declare userId: ForeignKey<User['id']>
  declare statusName: ForeignKey<LotStatus['name']>
  declare title: string
  declare description: string | null
  declare effectiveDate: Date | null
  declare expirationDate: Date | null
  declare initialDuration: string
  declare initialAmount: number
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date | null>

  declare user?: NonAttribute<User>
  declare getUser: BelongsToGetAssociationMixin<User>
  declare setUser: BelongsToSetAssociationMixin<User, number>

  declare status?: NonAttribute<LotStatus>
  declare getStatus: BelongsToGetAssociationMixin<LotStatus>
  declare setStatus: BelongsToSetAssociationMixin<LotStatus, string>

  declare bets?: NonAttribute<LotBet[]>
  declare getBets: HasManyGetAssociationsMixin<LotBet>
  declare addBet: HasManyAddAssociationMixin<LotBet, number>
  declare addBets: HasManyAddAssociationsMixin<LotBet, number>
  declare setBets: HasManySetAssociationsMixin<LotBet, number>
  declare removeBet: HasManyRemoveAssociationMixin<LotBet, number>
  declare removeBets: HasManyRemoveAssociationsMixin<LotBet, number>
  declare hasBet: HasManyHasAssociationMixin<LotBet, string>
  declare hasBets: HasManyHasAssociationsMixin<LotBet, number>
  declare countBets: HasManyCountAssociationsMixin

  static associate(database: Database) {
    database.Lot.belongsTo(database.User, {
      as: 'user',
      foreignKey: 'userId',
    })

    database.Lot.belongsTo(database.LotStatus, {
      as: 'status',
      foreignKey: 'statusName',
    })

    database.Lot.hasMany(database.LotBet, {
      as: 'bets',
      foreignKey: 'lotId',
    })
  }
}

export function InitializeLot(database: DatabaseOptional) {
  Lot.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      statusName: {
        type: DataTypes.STRING(32),
        allowNull: false,
        references: {
          model: 'lot_statuses',
          key: 'name',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      title: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING(1028),
        allowNull: true,
      },
      effectiveDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      expirationDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      initialAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        get() {
          // @ts-expect-error sequelize issue #8019
          const value: string = this.getDataValue('initialAmount')
          return value === null ? null : parseFloat(value)
        },
      },
      initialDuration: {
        type: DataTypes.ENUM('1_hour', '1_day', '3_days', '7_days'),
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize: database.sequelize,
      modelName: 'Lot',
      tableName: 'lots',
      timestamps: true,
    },
  )

  return Lot
}
