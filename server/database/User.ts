import { DataTypes, Model } from 'sequelize'
import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize'
import { sequelize } from './connect'

export type UserAttributes = InferAttributes<User>

export type UserCreationAttributes = InferCreationAttributes<User>

export class User extends Model<UserAttributes, UserCreationAttributes> {
  declare id: CreationOptional<number>

  declare email: string

  declare username: string

  declare password: string

  declare createdAt: CreationOptional<Date>

  declare updatedAt: CreationOptional<Date>
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING(64),
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
      defaultValue: null,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
  },
)