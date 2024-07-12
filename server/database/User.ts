import { DataTypes, Model } from 'sequelize'
import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  Sequelize,
} from 'sequelize'

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

export function UserFactory(sequelize: Sequelize) {
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

  return User
}
