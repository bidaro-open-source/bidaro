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
  NonAttribute,
} from 'sequelize'
import type { MakeNullishOptional } from 'sequelize/lib/utils'
import type { Database, DatabaseOptional } from '../types'
import type { Role } from './Role'
import { DataTypes, Model } from 'sequelize'

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
  declare displayName: string | null
  declare description: string | null
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  // Role associations
  declare roles?: NonAttribute<Role[]>
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
      as: 'roles',
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
      displayName: {
        type: DataTypes.STRING(64),
        allowNull: true,
      },
      description: {
        type: DataTypes.STRING(1024),
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
      modelName: 'Permission',
      tableName: 'permissions',
      timestamps: true,
    },
  )

  return Permission
}
