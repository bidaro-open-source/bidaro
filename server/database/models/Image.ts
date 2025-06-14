import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize'
import type { MakeNullishOptional } from 'sequelize/lib/utils'
import type { Database, DatabaseOptional } from '../types'
import { DataTypes, Model } from 'sequelize'

export type ImageModel = typeof Image
export type ImageAttributes = InferAttributes<Image>
export type ImageCreationAttributes = InferCreationAttributes<Image>
export type ImageAttributesOptional = MakeNullishOptional<ImageCreationAttributes>

export class Image extends Model<ImageAttributes, ImageCreationAttributes> {
  declare id: CreationOptional<number>
  declare path: string
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  static associate(db: Database) {
    db.Image.hasMany(db.Lot, {
      foreignKey: {
        name: 'imageId',
        allowNull: true,
      },
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
      path: {
        type: DataTypes.STRING,
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
      modelName: 'Image',
      tableName: 'images',
      timestamps: true,
    },
  )

  return Image
}
