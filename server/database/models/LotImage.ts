import type {
  CreationOptional,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize'
import type { Database, DatabaseOptional } from '../types'
import type { Image } from './Image'
import type { Lot } from './Lot'
import {
  DataTypes,
  Model,
} from 'sequelize'

export type LotImageModel = typeof LotImage
export type LotImageAttributes = InferAttributes<LotImage>
export type LotImageCreationAttributes = InferCreationAttributes<LotImage>

export class LotImage extends Model<LotImageAttributes, LotImageCreationAttributes> {
  declare id: CreationOptional<number>
  declare lotId: ForeignKey<Lot['id']>
  declare imageId: ForeignKey<Image['id']>
  declare order: number

  static associate(database: Database) {
    database.LotImage.belongsTo(database.Lot, {
      foreignKey: 'lotId',
    })

    database.LotImage.belongsTo(database.Image, {
      foreignKey: 'imageId',
    })
  }
}

export function InitializeLotImage(database: DatabaseOptional) {
  LotImage.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      lotId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'lots', key: 'id' },
        onDelete: 'CASCADE',
      },
      imageId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'images', key: 'id' },
        onDelete: 'CASCADE',
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize: database.sequelize,
      modelName: 'LotImage',
      tableName: 'lot_images',
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ['lotId', 'order'],
        },
      ],
    },
  )

  return LotImage
}
