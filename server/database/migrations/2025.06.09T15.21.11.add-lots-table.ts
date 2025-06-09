import type { Migration } from '../console/migrator-cli'
import { DataTypes } from 'sequelize'

export const up: Migration = async ({ context }) => {
  const queryInterface = context.sequelize.getQueryInterface()

  await queryInterface.createTable('lot_statuses', {
    name: {
      type: DataTypes.STRING(32),
      unique: true,
      primaryKey: true,
      allowNull: false,
    },
  })

  await queryInterface.bulkInsert('lot_statuses', [
    { name: 'draft' },
    { name: 'in_trading_process' },
    { name: 'in_discussion_process' },
    { name: 'in_delivery_process' },
    { name: 'received' },
    { name: 'rejected' },
  ])

  await queryInterface.createTable('lots', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    title: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(1028),
      allowNull: true,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    statusName: {
      type: DataTypes.STRING(32),
      allowNull: false,
      references: {
        model: 'lot_statuses',
        key: 'name',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
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
}

export const down: Migration = async ({ context }) => {
  const queryInterface = context.sequelize.getQueryInterface()

  await queryInterface.dropTable('lots')
  await queryInterface.dropTable('lot_statuses')
}
