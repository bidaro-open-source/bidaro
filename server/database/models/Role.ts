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
import type { Permission } from './Permission'
import type { User } from './User'

export type RoleModel = typeof Role
export type RoleAttributes = InferAttributes<Role>
export type RoleCreationAttributes = InferCreationAttributes<Role>
export type RoleAttributesOptional = MakeNullishOptional<RoleCreationAttributes>

export class Role extends Model<RoleAttributes, RoleCreationAttributes> {
  declare id: CreationOptional<number>
  declare name: string
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  // User associations
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
      foreignKey: 'roleId',
    })

    database.Role.belongsToMany(database.Permission, {
      through: 'roles_has_permissions',
      foreignKey: 'roleId',
      otherKey: 'permissionId',
      timestamps: false,
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
