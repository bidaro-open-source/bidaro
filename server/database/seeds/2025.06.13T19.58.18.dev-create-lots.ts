import type { Seeder } from '../console/seeder-cli'
import type { Lot } from '../models/Lot'
import { fakerUK as faker, faker as fakerEN } from '@faker-js/faker'
import { lotStatuses, roles } from '~~/server/constants'
import { calcualteLotMinimalStep, calculateLotDuration } from '~~/server/services/lot-service'

const USER_COUNT = 20
const LOT_COUNT = 500
const BETS_COUNT = 100

export const up: Seeder = async ({ context }) => {
  const userIds = []

  faker.seed(123)

  for (let i = 0; i < USER_COUNT; i++) {
    const sex = faker.person.sexType()
    const name = faker.person.firstName(sex)
    const surname = faker.person.lastName(sex)

    const nameEn = fakerEN.person.firstName(sex).toLowerCase().replaceAll('-', '_')
    const username = `${nameEn}_${i}`

    const user = await context.UserFactory.new().create({
      roleName: roles.USER,
      email: faker.internet.email({ provider: 'gmail.com' }),
      name,
      surname,
      username,
    })

    userIds.push(user.id)
  }

  const durations = ['1_hour', '1_day', '3_days', '7_days'] as const
  const categories = await context.Category.findAll({ attributes: ['id'] })
  const categoriesIds = categories.map(category => category.id)

  const lots: Lot[] = []

  const paths = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.jpg', '8.jpg', '9.jpg', '10.jpg']

  for (let i = 0; i < LOT_COUNT; i++) {
    const randomUserId = faker.helpers.arrayElement(userIds)
    const randomCategoryId = faker.helpers.arrayElement(categoriesIds)
    const randomDuration = faker.helpers.arrayElement(durations)
    const randomDurationInMs = calculateLotDuration(randomDuration)
    const randomImage = faker.helpers.arrayElement(paths)

    const randomAmount = faker.number.float({ min: 1, max: 10000, fractionDigits: 2 })

    const image = await context.Image.create({
      path: randomImage,
    })

    const lot = await context.LotFactory.new().create({
      userId: randomUserId,
      imageId: image.id,
      categoryId: i % 10 === 0 ? null : randomCategoryId,
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraph(),
      statusName: lotStatuses.IN_TRADING_PROCESS,
      initialAmount: randomAmount,
      initialDuration: randomDuration,
      effectiveDate: new Date(),
      expirationDate: new Date(Date.now() + randomDurationInMs),
    })

    await context.LotBetFactory.new().create({
      lotId: lot.id,
      userId: randomUserId,
      amount: randomAmount,
    })

    lots.push(lot)
  }

  for (let i = 0; i < BETS_COUNT; i++) {
    const randomLot = faker.helpers.arrayElement(lots)
    const randomUserId = faker.helpers.arrayElement(userIds)
    const minimalBetAmountStep = calcualteLotMinimalStep(randomLot.initialAmount)
    const minimalBetAmount = randomLot.initialAmount + minimalBetAmountStep

    if (minimalBetAmount > 10000) {
      continue
    }

    if (randomUserId === randomLot.userId) {
      continue
    }

    const randomAmount = faker.number.float({
      min: minimalBetAmount,
      max: 10000,
      fractionDigits: 2,
    })

    await context.LotBetFactory.new().create({
      lotId: randomLot.id,
      userId: randomUserId,
      amount: randomAmount,
    })

    // ONLY FOR DEV
    // NEVER DO THIS IN PRODUCTION
    randomLot.initialAmount = randomAmount
  }
}
