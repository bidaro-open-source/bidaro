import type { Migration } from '../console/migrator-cli'
import { DataTypes } from 'sequelize'
import { permissions, roles } from '../../constants'

export const up: Migration = async ({ context }) => {
  const queryInterface = context.sequelize.getQueryInterface()

  const transaction = await queryInterface.sequelize.transaction()

  try {
    await queryInterface.createTable('users', {
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
      roleName: {
        type: DataTypes.STRING(64),
        defaultValue: null,
        allowNull: true,
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        references: {
          model: 'roles',
          key: 'name',
        },
      },
      password: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(32),
        allowNull: true,
      },
      surname: {
        type: DataTypes.STRING(32),
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
    })

    await queryInterface.bulkInsert('permissions', [
      { name: permissions.VIEW_OWN_SESSIONS, createdAt: new Date() },
      { name: permissions.DELETE_OWN_SESSIONS, createdAt: new Date() },
      { name: permissions.UPDATE_OWN_PROFILE, createdAt: new Date() },
      { name: permissions.UPDATE_OWN_EMAIL, createdAt: new Date() },
      { name: permissions.UPDATE_OWN_PASSWORD, createdAt: new Date() },
      { name: permissions.VIEW_USERS, createdAt: new Date() },
      { name: permissions.CREATE_USER, createdAt: new Date() },
      { name: permissions.VERIFY_USER, createdAt: new Date() },
      { name: permissions.UPDATE_USER_ROLE, createdAt: new Date() },
      { name: permissions.DELETE_USER, createdAt: new Date() },
    ], { transaction })

    await queryInterface.bulkInsert('roles_has_permissions', [
      { role: roles.USER, permission: permissions.VIEW_OWN_SESSIONS },
      { role: roles.USER, permission: permissions.DELETE_OWN_SESSIONS },
    ], { transaction })

    await transaction.commit()
  }
  catch (error: any) {
    await transaction.rollback()
    throw new Error(error)
  }
}

export const down: Migration = async ({ context }) => {
  const queryInterface = context.sequelize.getQueryInterface()

  await queryInterface.dropTable('users')
}
