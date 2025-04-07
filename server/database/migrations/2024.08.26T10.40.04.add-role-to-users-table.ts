import type { Migration } from '.'
import { DataTypes } from 'sequelize'

export const up: Migration = async ({ context }) => {
  const queryInterface = context.sequelize.getQueryInterface()

  try {
    await queryInterface.addColumn('users', 'roleName', {
      type: DataTypes.STRING(64),
      defaultValue: null,
      allowNull: true,
      onUpdate: 'CASCADE',
      references: {
        model: 'roles',
        key: 'name',
      },
    })
  }
  catch (error: any) {
    throw new Error(error)
  }
}

export const down: Migration = async ({ context }) => {
  const queryInterface = context.sequelize.getQueryInterface()

  await queryInterface.removeColumn('users', 'roleName')
}
