import type { Transaction } from 'sequelize'
import type { Category, CategoryAttributesOptional } from '../database/models/Category'

interface Options {
  transaction?: Transaction
}

export const categoryRepository = {
  /**
   * Finds a category by their primary key.
   *
   * @param id - category primary key
   * @param options - sequelize options
   * @returns Category instance or null if not found
   */
  findById: (id: number, options: Options = {}): Promise<Category | null> => {
    const db = useDatabase()

    return db.Category.findByPk(id, {
      transaction: options.transaction,
      include: {
        model: db.Category,
        as: 'children',
      },
    })
  },

  /**
   * Finds a category by their primary key or fail.
   *
   * @param id - category primary key
   * @param options - sequelize options
   * @returns Category instance or null if not found
   * @throws - if category is not exists
   */
  findByIdOrFail: async (id: number, options: Options = {}): Promise<Category> => {
    const category = await categoryRepository.findById(id, options)

    if (!category) {
      throw createError({
        message: 'Категорію не знайдено',
        status: 404,
      })
    }

    return category
  },

  /**
   * Finds a category by their slug.
   *
   * @param slug - category slug
   * @param options - sequelize options
   * @returns Category instance or null if not found
   */
  findBySlug: (slug: string, options: Options = {}): Promise<Category | null> => {
    const db = useDatabase()

    return db.Category.findOne({
      where: { slug },
      transaction: options.transaction,
      include: {
        model: db.Category,
        as: 'children',
      },
    })
  },

  /**
   * Finds categories by their parent id.
   *
   * @param parentId - category parent id
   * @param options - sequelize options
   * @returns Category instance or null if not found
   */
  findAllByParentId: (parentId: number | null, options: Options = {}): Promise<Category[]> => {
    const db = useDatabase()

    return db.Category.findAll({
      where: { parentId },
      transaction: options.transaction,
    })
  },

  /**
   * Creates a new category record in the database.
   *
   * @param fields - category attributes
   * @param options - sequelize options
   * @returns category instance
   */
  create(fields: CategoryAttributesOptional, options: Options = {}): Promise<Category> {
    const db = useDatabase()

    return db.Category.create(
      fields,
      { transaction: options.transaction },
    )
  },

  /**
   * Save a changed category in the database.
   *
   * @param category - category instance
   * @param options - sequelize options
   */
  save(category: Category, options: Options = {}) {
    return category.save({ transaction: options.transaction })
  },

  /**
   * Creates a new category record in the database.
   *
   * @param id - category primary key
   * @param options - sequelize options
   * @returns category instance
   */
  destory(id: number, options: Options = {}) {
    const db = useDatabase()

    return db.Category.destroy({
      where: { id },
      transaction: options.transaction,
    })
  },
}
