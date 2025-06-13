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
import type { Lot } from './Lot'
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
  declare displayName: string
  declare description: string | null

  declare parent?: NonAttribute<Category>
  declare children?: NonAttribute<Category[]>

  declare getParent: BelongsToGetAssociationMixin<Category>
  declare setParent: BelongsToSetAssociationMixin<Category, number>

  declare getChildren: HasManyGetAssociationsMixin<Category>
  declare addChild: HasManyAddAssociationMixin<Category, number>

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
