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
  declare name: string
  declare displayName: string | null
  declare description: string | null
  declare isReserved: CreationOptional<boolean>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  // Role associations
  declare roles?: NonAttribute<Role[]>
  declare getRoles: HasManyGetAssociationsMixin<Role>
  declare addRole: HasManyAddAssociationMixin<Role, string>
  declare addRoles: HasManyAddAssociationsMixin<Role, string>
  declare setRoles: HasManySetAssociationsMixin<Role, string>
  declare removeRole: HasManyRemoveAssociationMixin<Role, string>
  declare removeRoles: HasManyRemoveAssociationsMixin<Role, string>
  declare hasRole: HasManyHasAssociationMixin<Role, string>
  declare hasRoles: HasManyHasAssociationsMixin<Role, string>
  declare countRoles: HasManyCountAssociationsMixin

  static associate(database: Database) {
    database.Permission.belongsToMany(database.Role, {
      through: 'roles_has_permissions',
      foreignKey: 'permission',
      otherKey: 'role',
      timestamps: false,
      as: 'roles',
    })
  }
}

export function InitializePermission(database: DatabaseOptional) {
  Permission.init(
    {
      name: {
        type: DataTypes.STRING(64),
        primaryKey: true,
      },
      displayName: {
        type: DataTypes.STRING(64),
        allowNull: true,
      },
      description: {
        type: DataTypes.STRING(1024),
        allowNull: true,
      },
      isReserved: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        set(value: boolean) {
          // Prevent setting isReserved to true at model level
          // This field can only be set to true through migrations
          if (value === true) {
            throw new Error('Cannot set isReserved to true')
          }
          this.setDataValue('isReserved', value)
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
      modelName: 'Permission',
      tableName: 'permissions',
      timestamps: true,
    },
  )

  return Permission
}
