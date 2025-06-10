import type { Migration } from '../console/migrator-cli'
import { DataTypes } from 'sequelize'

export const up: Migration = async ({ context }) => {
  const queryInterface = context.sequelize.getQueryInterface()

  await queryInterface.createTable('lot_bets', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    lotId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'lots',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  })
}

export const down: Migration = async ({ context }) => {
  const queryInterface = context.sequelize.getQueryInterface()

  await queryInterface.dropTable('lot_bets')
}
