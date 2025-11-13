import type { Migration } from '../console/migrator-cli'
import { DataTypes } from 'sequelize'
import { permissions, roles } from '../../constants'
import categories from './data/categories.json'

export const up: Migration = async ({ context }) => {
  const queryInterface = context.sequelize.getQueryInterface()

  const transaction = await queryInterface.sequelize.transaction()

  try {
    await queryInterface.createTable('categories', {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      parentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'categories',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      slug: {
        type: DataTypes.STRING(128),
        unique: true,
        allowNull: false,
      },
      displayName: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING(1028),
        allowNull: true,
      },
    }, { transaction })

    await queryInterface.addColumn('lots', 'categoryId', {
      type: DataTypes.INTEGER,
      defaultValue: null,
      allowNull: true,
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      references: {
        model: 'categories',
        key: 'id',
      },
    }, { transaction })

    await queryInterface.bulkInsert('categories', categories, { transaction })

    await queryInterface.sequelize.query(`
      SELECT setval(pg_get_serial_sequence('"categories"', 'id'), COALESCE(MAX(id), 0) + 1, false)
      FROM "categories";
    `, { transaction })

    await queryInterface.bulkInsert('permissions', [
      { name: permissions.CREATE_CATEGORY, createdAt: new Date() },
      { name: permissions.UPDATE_CATEGORY, createdAt: new Date() },
      { name: permissions.DELETE_CATEGORY, createdAt: new Date() },
    ], { transaction })

    await queryInterface.bulkInsert('roles_has_permissions', [
      { role: roles.USER, permission: permissions.CREATE_CATEGORY },
      { role: roles.USER, permission: permissions.UPDATE_CATEGORY },
      { role: roles.USER, permission: permissions.DELETE_CATEGORY },
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

  await queryInterface.removeColumn('lots', 'categoryId')
  await queryInterface.dropTable('categories')
}
