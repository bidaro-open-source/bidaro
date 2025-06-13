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
import type { Role } from './Role'
import { DataTypes, Model } from 'sequelize'

export type UserModel = typeof User
export type UserAttributes = InferAttributes<User>
export type UserCreationAttributes = InferCreationAttributes<User>
export type UserAttributesOptional = MakeNullishOptional<UserCreationAttributes>

export class User extends Model<UserAttributes, UserCreationAttributes> {
  declare id: CreationOptional<number>
  declare email: string
  declare name: string | null
  declare surname: string | null
  declare username: string
  declare password: string
  declare emailVerifiedAt: CreationOptional<Date | null>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date | null>

  declare role?: NonAttribute<Role>
  declare roleName: ForeignKey<Role['name']> | null
  declare setRole: BelongsToSetAssociationMixin<Role, number>
  declare getRole: BelongsToGetAssociationMixin<Role>

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

  declare bets?: NonAttribute<Lot[]>
  declare getBets: HasManyGetAssociationsMixin<Lot>
  declare addBet: HasManyAddAssociationMixin<Lot, number>
  declare addBets: HasManyAddAssociationsMixin<Lot, number>
  declare setBets: HasManySetAssociationsMixin<Lot, number>
  declare removeBet: HasManyRemoveAssociationMixin<Lot, number>
  declare removeBets: HasManyRemoveAssociationsMixin<Lot, number>
  declare hasBet: HasManyHasAssociationMixin<Lot, string>
  declare hasBets: HasManyHasAssociationsMixin<Lot, number>
  declare countBets: HasManyCountAssociationsMixin

  static associate(database: Database) {
    database.User.hasMany(database.Lot, {
      as: 'lots',
      foreignKey: {
        name: 'userId',
        allowNull: false,
      },
    })

    database.User.hasMany(database.Lot, {
      as: 'winLots',
      foreignKey: {
        name: 'winnerId',
        allowNull: false,
      },
    })

    database.User.hasMany(database.LotBet, {
      as: 'bets',
      foreignKey: {
        name: 'userId',
        allowNull: false,
      },
    })

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
      name: {
        type: DataTypes.STRING(64),
        allowNull: true,
      },
      surname: {
        type: DataTypes.STRING(64),
        allowNull: true,
      },
      emailVerifiedAt: {
        type: DataTypes.DATE,
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
      modelName: 'User',
      tableName: 'users',
      timestamps: true,
    },
  )

  return User
}
