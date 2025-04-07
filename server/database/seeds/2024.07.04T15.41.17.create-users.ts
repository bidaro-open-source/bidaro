import type { Seeder } from '.'

export const up: Seeder = async ({ context }) => {
  context.UserFactory.new().create({
    email: 'seed@gmail.com',
  })
}

export const down: Seeder = async ({ context }) => {
  const queryInterface = context.sequelize.getQueryInterface()

  await queryInterface.bulkDelete('users', {
    email: ['seed@gmail.com'],
  })
}
