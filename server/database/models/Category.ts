import type {
  CreationOptional,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
} from 'sequelize'
import type { MakeNullishOptional } from 'sequelize/lib/utils'
import type { Database, DatabaseOptional } from '../types'
import {
  DataTypes,
  Model,
} from 'sequelize'

export type CategoryModel = typeof Category
export type CategoryAttributes = InferAttributes<Category>
export type CategoryCreationAttributes = InferCreationAttributes<Category>
export type CategoryAttributesOptional = MakeNullishOptional<CategoryCreationAttributes>

export class Category extends Model<InferAttributes<Category>, InferCreationAttributes<Category>> {
  declare id: CreationOptional<number>
  declare parentId: ForeignKey<Category['id']> | null
  declare slug: string
  declare displayName: string
  declare description: string | null

  declare parent?: NonAttribute<Category>
  declare children?: NonAttribute<Category[]>

  static associate(db: Database) {
    db.Category.belongsTo(db.Category, {
      as: 'parent',
      foreignKey: 'parentId',
    })

    db.Category.hasMany(db.Category, {
      as: 'children',
      foreignKey: 'parentId',
    })

    db.Category.hasMany(db.Lot, {
      as: 'lots',
      foreignKey: 'categoryId',
    })
  }
}

export function InitializeCategory(database: DatabaseOptional) {
  Category.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      parentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      slug: {
        type: DataTypes.STRING(128),
        unique: true,
        allowNull: false,
      },
      displayName: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize: database.sequelize,
      modelName: 'Category',
      tableName: 'categories',
      timestamps: false,
    },
  )

  return Category
}
