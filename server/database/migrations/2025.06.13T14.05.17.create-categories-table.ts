import type { Migration } from '../console/migrator-cli'
import { DataTypes } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import { permissions, roles } from '../../constants'

interface InsertCategoryOptions {
  parentId?: number
  displayName: string
  description?: string
  children?: InsertCategoryOptions[]
}

const categories: InsertCategoryOptions[] = [
  {
    displayName: 'Електроніка',
    description: 'Аукціони смартфонів, ноутбуків, техніки та ґаджетів.',
    children: [
      {
        displayName: 'Смартфони',
        children: [
          { displayName: 'iPhone' },
          { displayName: 'Android' },
          { displayName: 'Аксесуари для смартфонів' },
        ],
      },
      {
        displayName: 'Ноутбуки',
        children: [
          { displayName: 'Ігрові ноутбуки' },
          { displayName: 'Бізнес-ноутбуки' },
        ],
      },
      {
        displayName: 'Планшети',
        children: [
          { displayName: 'iPad' },
          { displayName: 'Android планшети' },
        ],
      },
      {
        displayName: 'Комп’ютери та комплектуючі',
        children: [
          { displayName: 'Неттопи' },
          { displayName: 'Моноблоки' },
          { displayName: 'Системні блоки' },
          { displayName: 'Десктопи' },
          { displayName: 'Сервери' },
          {
            displayName: 'Аксесуари для комп’ютерів',
            children: [
              { displayName: 'Мишки' },
              { displayName: 'Клавіатури' },
              { displayName: 'Кардрідери та USB-хаби' },
              { displayName: 'Мережеві фільтри' },
              { displayName: 'Мікрофони' },
              { displayName: 'Килимки для мишок' },
              { displayName: 'Підставки для ноутбуків' },
              { displayName: 'Веб-камери' },
              { displayName: 'Колонки для ПК' },
              { displayName: 'Зовнішні жорсткі диски' },
              { displayName: 'SSD-накопичувачі' },
            ],
          },
        ],
      },
    ],
  },
  {
    displayName: 'Побутова техніка',
    description: 'Холодильники, пральні, мікрохвильовки й інше.',
    children: [
      { displayName: 'Холодильники' },
      { displayName: 'Пральні машини' },
      { displayName: 'Мікрохвильовки' },
      { displayName: 'Сушарки' },
    ],
  },
  {
    displayName: 'Одяг та взуття',
    description: 'Одяг і взуття для жінок та чоловіків. Новинки та бренди',
    children: [
      { displayName: 'Жіночий одяг' },
      { displayName: 'Чоловічий одяг' },
      { displayName: 'Жіноче взуття' },
      { displayName: 'Чоловіче взуття' },
    ],
  },
  {
    displayName: 'Авто та мото',
    description: 'Продаж авто, мотоциклів, запчастин та аксесуарів.',
    children: [
      { displayName: 'Автомобілі' },
      { displayName: 'Мотоцикли' },
      { displayName: 'Запчастини' },
      { displayName: 'Аксесуари' },
    ],
  },
  {
    displayName: 'Дитячі товари',
    description: 'Іграшки, візочки, одяг, меблі та інші корисні речі.',
    children: [
      { displayName: 'Іграшки' },
      { displayName: 'Візочки' },
      { displayName: 'Одяг' },
      { displayName: 'Меблі' },
    ],
  },
  {
    displayName: 'Меблі та інтер\'єр',
    description: 'Меблі для дому, офісу та саду. Декоративні рішення.',
    children: [
      { displayName: 'Меблі для дому' },
      { displayName: 'Меблі для офісу' },
      { displayName: 'Меблі для саду' },
      { displayName: 'Декоративні рішення' },
    ],
  },
  {
    displayName: 'Колекціонування',
    description: 'Монети, марки, антикваріат і рідкісні речі для колекціонерів.',
    children: [
      { displayName: 'Монети' },
      { displayName: 'Марки' },
      { displayName: 'Антикваріат' },
      { displayName: 'Рідкісні речі' },
    ],
  },
  {
    displayName: 'Їжа і напої',
    description: 'Продукти харчування, делікатеси та напої.',
    children: [
      { displayName: 'Продукти харчування' },
      { displayName: 'Делікатеси' },
      { displayName: 'Напої' },
    ],
  },
]

export const up: Migration = async ({ context }) => {
  const queryInterface = context.sequelize.getQueryInterface()

  const transaction = await queryInterface.sequelize.transaction()

  try {
    await queryInterface.createTable('categories', {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      parentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'categories',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      slug: {
        type: DataTypes.STRING(128),
        unique: true,
        allowNull: false,
      },
      displayName: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING(1028),
        allowNull: true,
      },
    }, { transaction })

    async function insertCategory(category: InsertCategoryOptions) {
      const [categoryRecord] = await queryInterface.bulkInsert(
        'categories',
        [
          {
            displayName: category.displayName,
            description: category.description,
            parentId: category.parentId,
            slug: uuidv4(),
          },
        ],
        // @ts-expect-error sequelize bug
        { transaction, returning: true },
      ) as { id: number }[]

      if (category.children) {
        for (const child of category.children) {
          await insertCategory({
            ...child,
            parentId: categoryRecord.id,
          })
        }
      }
    }

    for (const category of categories) {
      await insertCategory(category)
    }

    await queryInterface.addColumn('lots', 'categoryId', {
      type: DataTypes.INTEGER,
      defaultValue: null,
      allowNull: true,
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      references: {
        model: 'categories',
        key: 'id',
      },
    }, { transaction })

    await queryInterface.bulkInsert('permissions', [
      { name: permissions.CREATE_CATEGORY, createdAt: new Date() },
      { name: permissions.UPDATE_CATEGORY, createdAt: new Date() },
      { name: permissions.DELETE_CATEGORY, createdAt: new Date() },
    ], { transaction })

    await queryInterface.bulkInsert('roles_has_permissions', [
      { role: roles.USER, permission: permissions.CREATE_CATEGORY },
      { role: roles.USER, permission: permissions.UPDATE_CATEGORY },
      { role: roles.USER, permission: permissions.DELETE_CATEGORY },
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

  await queryInterface.removeColumn('lots', 'categoryId')
  await queryInterface.dropTable('categories')
}
