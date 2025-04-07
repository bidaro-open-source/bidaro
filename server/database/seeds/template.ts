import type { Seeder } from '.'

export const up: Seeder = async ({ context }) => {
  const queryInterface = context.sequelize.getQueryInterface()

  await queryInterface.select(null, '')
}
