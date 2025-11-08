import type { Migration } from '../console/migrator-cli'
import { DataTypes } from 'sequelize'
import { lotStatuses } from '../../constants'

export const up: Migration = async ({ context }) => {
  const queryInterface = context.sequelize.getQueryInterface()

  const transaction = await queryInterface.sequelize.transaction()

  try {
    await queryInterface.createTable('lot_statuses', {
      name: {
        type: DataTypes.STRING(32),
        unique: true,
        primaryKey: true,
        allowNull: false,
      },
      displayName: {
        type: DataTypes.STRING(64),
        allowNull: true,
      },
      description: {
        type: DataTypes.STRING(1024),
        allowNull: true,
      },
    }, { transaction })

    await queryInterface.bulkInsert('lot_statuses', [
      { name: lotStatuses.DRAFT },
      { name: lotStatuses.IN_TRADING_PROCESS },
      { name: lotStatuses.IN_DISCUSSION_PROCESS },
      { name: lotStatuses.IN_DELIVERY_PROCESS },
      { name: lotStatuses.RECEIVED },
      { name: lotStatuses.REJECTED },
    ], { transaction })

    await queryInterface.addColumn('lots', 'statusName', {
      type: DataTypes.STRING(32),
      defaultValue: lotStatuses.DRAFT,
      allowNull: false,
      references: {
        model: 'lot_statuses',
        key: 'name',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    }, { transaction })

    await transaction.commit()
  }
  catch (error: any) {
    await transaction.rollback()
    throw new Error(error)
  }
}

export const down: Migration = async ({ context }) => {
  const queryInterface = context.sequelize.getQueryInterface()

  await queryInterface.removeColumn('lots', 'statusName')
  await queryInterface.dropTable('lot_statuses')
}
