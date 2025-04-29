import type { Seeder } from '../console/seeder-cli'

export const up: Seeder = async ({ context }) => {
  const queryInterface = context.sequelize.getQueryInterface()

  await queryInterface.select(null, '')
}
