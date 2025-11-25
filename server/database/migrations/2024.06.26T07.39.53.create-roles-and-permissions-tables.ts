import type { Migration } from '../console/migrator-cli'
import { DataTypes } from 'sequelize'
import { permissions, roles } from '../../constants'

export const up: Migration = async ({ context }) => {
  const queryInterface = context.sequelize.getQueryInterface()

  const transaction = await queryInterface.sequelize.transaction()

  try {
    await queryInterface.createTable('roles', {
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
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    }, { transaction })

    await queryInterface.createTable('permissions', {
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
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    }, { transaction })

    await queryInterface.createTable('roles_has_permissions', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING(64),
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false,
        references: {
          model: 'roles',
          key: 'name',
        },
      },
      permission: {
        type: DataTypes.STRING(64),
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false,
        references: {
          model: 'permissions',
          key: 'name',
        },
      },
    }, { transaction })

    await queryInterface.bulkInsert('roles', [{
      name: roles.USER,
      displayName: 'Користувач',
      description: 'Роль за замовчуванням',
      createdAt: new Date(),
    }], { transaction })

    await queryInterface.bulkInsert('permissions', [
      { name: permissions.CLEAR_CACHE, createdAt: new Date() },
      { name: permissions.VIEW_ROLES, createdAt: new Date() },
      { name: permissions.CREATE_ROLE, createdAt: new Date() },
      { name: permissions.UPDATE_ROLE, createdAt: new Date() },
      { name: permissions.DELETE_ROLE, createdAt: new Date() },
      { name: permissions.VIEW_PERMISSIONS, createdAt: new Date() },
      { name: permissions.UPDATE_PERMISSIONS, createdAt: new Date() },
      { name: permissions.VIEW_ROLE_PERMISSIONS, createdAt: new Date() },
      { name: permissions.UPDATE_ROLE_PERMISSIONS, createdAt: new Date() },
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

  await queryInterface.dropTable('roles_has_permissions')
  await queryInterface.dropTable('permissions')
  await queryInterface.dropTable('roles')
}
