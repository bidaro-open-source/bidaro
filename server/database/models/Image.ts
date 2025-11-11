import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize'
import type { MakeNullishOptional } from 'sequelize/lib/utils'
import type { Database, DatabaseOptional } from '../types'
import {
  DataTypes,
  Model,
} from 'sequelize'

export type ImageModel = typeof Image
export type ImageAttributes = InferAttributes<Image>
export type ImageCreationAttributes = InferCreationAttributes<Image>
export type ImageAttributesOptional = MakeNullishOptional<ImageCreationAttributes>

export class Image extends Model<ImageAttributes, ImageCreationAttributes> {
  declare id: CreationOptional<number>
  declare bucket: string
  declare key: string
  declare mime_type: string
  declare size_bytes: number
  declare metadata: object | null
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date | null>

  static associate(database: Database) {
    database.Image.belongsToMany(database.Lot, {
      through: database.LotImage,
      foreignKey: 'imageId',
      otherKey: 'lotId',
      as: 'lots',
    })
  }
}

export function InitializeImage(database: DatabaseOptional) {
  Image.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      bucket: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      mime_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      size_bytes: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
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
      modelName: 'Image',
      tableName: 'images',
      timestamps: true,
    },
  )

  return Image
}
