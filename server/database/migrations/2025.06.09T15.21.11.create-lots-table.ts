import type { Migration } from '../console/migrator-cli'
import { DataTypes } from 'sequelize'
import { lotInitialDurations, permissions } from '../../constants'

export const up: Migration = async ({ context }) => {
  const queryInterface = context.sequelize.getQueryInterface()

  const transaction = await queryInterface.sequelize.transaction()

  try {
    await queryInterface.createTable('lots', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      sellerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      winnerId: {
        type: DataTypes.INTEGER,
        defaultValue: null,
        allowNull: true,
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        references: {
          model: 'users',
          key: 'id',
        },
      },
      categoryId: {
        type: DataTypes.INTEGER,
        defaultValue: null,
        allowNull: true,
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        references: {
          model: 'categories',
          key: 'id',
        },
      },
      title: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING(1028),
        allowNull: true,
      },
      effectiveDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      expirationDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      initialDuration: {
        type: DataTypes.ENUM(
          lotInitialDurations.ONE_HOUR,
          lotInitialDurations.ONE_DAY,
          lotInitialDurations.THREE_DAYS,
          lotInitialDurations.SEVEN_DAYS,
        ),
        allowNull: false,
      },
      initialPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      currentPrice: {
        type: DataTypes.DECIMAL(10, 2),
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
    }, { transaction })

    await queryInterface.bulkInsert('permissions', [
      { name: permissions.VIEW_LOTS, createdAt: new Date() },
      { name: permissions.CREATE_LOT, createdAt: new Date() },
      { name: permissions.UPDATE_LOT, createdAt: new Date() },
      { name: permissions.DELETE_LOT, createdAt: new Date() },
      { name: permissions.PUBLISH_LOT, createdAt: new Date() },
      { name: permissions.CLOSE_LOT, createdAt: new Date() },
      { name: permissions.SHIP_LOT, createdAt: new Date() },
      { name: permissions.RECEIVE_LOT, createdAt: new Date() },
      { name: permissions.CREATE_LOT_BET, createdAt: new Date() },
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
  // DON'T REMOVE {} - THROWNS ERROR
  await queryInterface.dropTable('lots', {})
}
