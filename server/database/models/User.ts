import type {
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  CreationOptional,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
} from 'sequelize'
import type { MakeNullishOptional } from 'sequelize/lib/utils'
import { DataTypes, Model } from 'sequelize'
import type { Database, DatabaseOptional } from '../types'
import type { Role } from './Role'

export type UserModel = typeof User
export type UserAttributes = InferAttributes<User>
export type UserCreationAttributes = InferCreationAttributes<User>
export type UserAttributesOptional = MakeNullishOptional<UserCreationAttributes>

export class User extends Model<UserAttributes, UserCreationAttributes> {
  declare id: CreationOptional<number>
  declare email: string
  declare username: string
  declare password: string
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  // Role association
  declare role?: NonAttribute<Role>
  declare roleId: ForeignKey<Role['id']> | null
  declare setRole: BelongsToSetAssociationMixin<Role, number>
  declare getRole: BelongsToGetAssociationMixin<Role>

  static associate(database: Database) {
    database.User.belongsTo(database.Role, {
      as: 'role',
    })
  }
}

export function InitializeUser(database: DatabaseOptional) {
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING(254),
        unique: true,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING(24),
        unique: true,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING(64),
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
      modelName: 'User',
      tableName: 'users',
      timestamps: true,
    },
  )

  return User
}
