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
import type { LotStatus } from './LotStatus'
import type { User } from './User'
import { DataTypes, Model } from 'sequelize'

export type LotModel = typeof Lot
export type LotAttributes = InferAttributes<Lot>
export type LotCreationAttributes = InferCreationAttributes<Lot>

export class Lot extends Model<LotAttributes, LotCreationAttributes> {
  declare id: CreationOptional<number>
  declare title: string
  declare description: string | null
  declare duration: number
  declare startDate: Date | null
  declare endDate: Date | null
  declare userId: ForeignKey<User['id']>
  declare statusName: ForeignKey<LotStatus['name']>

  // LotStatus association
  declare user?: NonAttribute<User>
  declare getUser: BelongsToGetAssociationMixin<User>
  declare setUser: BelongsToSetAssociationMixin<User, number>

  // LotStatus association
  declare status?: NonAttribute<LotStatus>
  declare getStatus: BelongsToGetAssociationMixin<LotStatus>
  declare setStatus: BelongsToSetAssociationMixin<LotStatus, string>

  static associate(database: Database) {
    database.Lot.belongsTo(database.User, {
      as: 'user',
      foreignKey: 'userId',
    })

    database.Lot.belongsTo(database.LotStatus, {
      as: 'status',
      foreignKey: 'statusName',
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
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      statusName: {
        type: DataTypes.STRING(32),
        allowNull: false,
        references: {
          model: 'lot_statuses',
          key: 'name',
        },
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
