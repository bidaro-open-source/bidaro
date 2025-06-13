import type { Migration } from '../console/migrator-cli'
import { DataTypes } from 'sequelize'

export const up: Migration = async ({ context }) => {
  const queryInterface = context.sequelize.getQueryInterface()

  try {
    await queryInterface.addColumn('lots', 'winnerId', {
      type: DataTypes.INTEGER,
      defaultValue: null,
      allowNull: true,
      onUpdate: 'CASCADE',
      references: {
        model: 'users',
        key: 'id',
      },
    })
  }
  catch (error: any) {
    throw new Error(error)
  }
}

export const down: Migration = async ({ context }) => {
  const queryInterface = context.sequelize.getQueryInterface()

  await queryInterface.removeColumn('lots', 'winnerId')
}
