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
import type { Permission } from './Permission'
import type { User } from './User'
import { DataTypes, Model } from 'sequelize'

export type RoleModel = typeof Role
export type RoleAttributes = InferAttributes<Role>
export type RoleCreationAttributes = InferCreationAttributes<Role>
export type RoleAttributesOptional = MakeNullishOptional<RoleCreationAttributes>

export class Role extends Model<RoleAttributes, RoleCreationAttributes> {
  declare id: CreationOptional<number>
  declare name: string
  declare displayName: string | null
  declare description: string | null
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  // User associations
  declare users?: NonAttribute<User[]>
  declare getUsers: HasManyGetAssociationsMixin<User>
  declare addUser: HasManyAddAssociationMixin<User, number>
  declare addUsers: HasManyAddAssociationsMixin<User, number>
  declare setUsers: HasManySetAssociationsMixin<User, number>
  declare removeUser: HasManyRemoveAssociationMixin<User, number>
  declare removeUsers: HasManyRemoveAssociationsMixin<User, number>
  declare hasUser: HasManyHasAssociationMixin<User, number>
  declare hasUsers: HasManyHasAssociationsMixin<User, number>
  declare countUsers: HasManyCountAssociationsMixin

  // Permission associations
  declare permissions?: NonAttribute<Permission[]>
  declare getPermissions: HasManyGetAssociationsMixin<Permission>
  declare addPermission: HasManyAddAssociationMixin<Permission, number>
  declare addPermissions: HasManyAddAssociationsMixin<Permission, number>
  declare setPermissions: HasManySetAssociationsMixin<Permission, number>
  declare removePermission: HasManyRemoveAssociationMixin<Permission, number>
  declare removePermissions: HasManyRemoveAssociationsMixin<Permission, number>
  declare hasPermission: HasManyHasAssociationMixin<Permission, number>
  declare hasPermissions: HasManyHasAssociationsMixin<Permission, number>
  declare countPermissions: HasManyCountAssociationsMixin

  static associate(database: Database) {
    database.Role.hasMany(database.User, {
      foreignKey: {
        name: 'roleId',
        allowNull: false,
      },
    })

    database.Role.belongsToMany(database.Permission, {
      through: 'roles_has_permissions',
      foreignKey: 'roleId',
      otherKey: 'permissionId',
      timestamps: false,
      as: 'permissions',
    })
  }
}

export function InitializeRole(database: DatabaseOptional) {
  Role.init(
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
      modelName: 'Role',
      tableName: 'roles',
      timestamps: true,
    },
  )

  return Role
}
