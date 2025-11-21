import type {
  CreationOptional,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
} from 'sequelize'
import type { MakeNullishOptional } from 'sequelize/lib/utils'
import type { Database, DatabaseOptional } from '../types'
import type { Category } from './Category'
import type { Image } from './Image'
import type { LotBet } from './LotBet'
import type { LotImage } from './LotImage'
import type { LotStatus } from './LotStatus'
import type { User } from './User'
import { DataTypes, Model } from 'sequelize'
import { lotInitialDurations } from '../../constants'

export type LotModel = typeof Lot
export type LotAttributes = InferAttributes<Lot>
export type LotCreationAttributes = InferCreationAttributes<Lot>
export type LotAttributesOptional = MakeNullishOptional<LotCreationAttributes>

export class Lot extends Model<LotAttributes, LotCreationAttributes> {
  declare id: CreationOptional<number>
  declare sellerId: ForeignKey<User['id']>
  declare winnerId: ForeignKey<User['id']> | null
  declare categoryId: ForeignKey<Category['id']> | null
  declare statusName: ForeignKey<LotStatus['name']>
  declare title: string
  declare description: string | null
  declare effectiveDate: Date | null
  declare expirationDate: Date | null
  declare initialDuration: string
  declare initialPrice: number
  declare currentPrice: number
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date | null>

  declare seller?: NonAttribute<User>
  declare winner?: NonAttribute<User>
  declare status?: NonAttribute<LotStatus>
  declare category?: NonAttribute<Category>
  declare bets?: NonAttribute<LotBet[]>
  declare images?: NonAttribute<Image[]>
  declare cover?: NonAttribute<LotImage>

  static associate(database: Database) {
    database.Lot.belongsTo(database.User, {
      as: 'seller',
      foreignKey: 'sellerId',
    })

    database.Lot.belongsTo(database.User, {
      as: 'winner',
      foreignKey: 'winnerId',
    })

    database.Lot.belongsTo(database.Category, {
      as: 'category',
      foreignKey: 'categoryId',
    })

    database.Lot.belongsTo(database.LotStatus, {
      as: 'status',
      foreignKey: 'statusName',
    })

    database.Lot.hasMany(database.LotBet, {
      as: 'bets',
      foreignKey: 'lotId',
    })

    database.Lot.belongsToMany(database.Image, {
      through: database.LotImage,
      foreignKey: 'lotId',
      otherKey: 'imageId',
      as: 'images',
    })

    database.Lot.hasOne(database.LotImage, {
      as: 'cover',
      foreignKey: 'lotId',
      scope: {
        order: 0,
      },
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
      sellerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      winnerId: {
        type: DataTypes.INTEGER,
        defaultValue: null,
        allowNull: true,
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        references: {
          model: 'users',
          key: 'id',
        },
      },
      categoryId: {
        type: DataTypes.INTEGER,
        defaultValue: null,
        allowNull: true,
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        references: {
          model: 'categories',
          key: 'id',
        },
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
      initialDuration: {
        type: DataTypes.ENUM(
          lotInitialDurations.ONE_HOUR,
          lotInitialDurations.ONE_DAY,
          lotInitialDurations.THREE_DAYS,
          lotInitialDurations.SEVEN_DAYS,
        ),
        allowNull: false,
      },
      initialPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        get() {
          // @ts-expect-error sequelize issue #8019
          const value: string = this.getDataValue('initialPrice')
          return value === null ? null : parseFloat(value)
        },
      },
      currentPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        get() {
          // @ts-expect-error sequelize issue #8019
          const value: string | null = this.getDataValue('currentPrice')
          return value === null ? null : parseFloat(value)
        },
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
