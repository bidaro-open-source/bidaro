import type {
  CreationOptional,
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
} from 'sequelize'
import type { MakeNullishOptional } from 'sequelize/lib/utils'
import { DataTypes, Model } from 'sequelize'
import type { Database, DatabaseOptional } from '../types'
import type { Role } from './Role'

export type PermissionModel = typeof Permission
export type PermissionAttributes = InferAttributes<Permission>
export type PermissionCreationAttributes = InferCreationAttributes<Permission>
export type PermissionAttributesOptional = MakeNullishOptional<
  PermissionCreationAttributes
>

export class Permission extends Model<
  PermissionAttributes,
  PermissionCreationAttributes
> {
  declare id: CreationOptional<number>
  declare name: string
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  // Role associations
  declare getRoles: HasManyGetAssociationsMixin<Role>
  declare addRole: HasManyAddAssociationMixin<Role, number>
  declare addRoles: HasManyAddAssociationsMixin<Role, number>
  declare setRoles: HasManySetAssociationsMixin<Role, number>
  declare removeRole: HasManyRemoveAssociationMixin<Role, number>
  declare removeRoles: HasManyRemoveAssociationsMixin<Role, number>
  declare hasRole: HasManyHasAssociationMixin<Role, number>
  declare hasRoles: HasManyHasAssociationsMixin<Role, number>
  declare countRoles: HasManyCountAssociationsMixin

  static associate(database: Database) {
    database.Permission.belongsToMany(database.Role, {
      through: 'roles_has_permissions',
      foreignKey: 'permissionId',
      otherKey: 'roleId',
      timestamps: false,
    })
  }
}

export function InitializePermission(database: DatabaseOptional) {
  Permission.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(64),
        unique: true,
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
      modelName: 'Permission',
      tableName: 'permissions',
      timestamps: true,
    },
  )

  return Permission
}
