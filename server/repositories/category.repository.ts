import type { Transaction } from 'sequelize'
import type { Category, CategoryAttributesOptional } from '../database/models/Category'
import { Op, QueryTypes } from 'sequelize'

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
  async findById(id: number, options: Options = {}): Promise<Category | null> {
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
  async findByIdOrFail(id: number, options: Options = {}): Promise<Category> {
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
  async findBySlug(slug: string, options: Options = {}): Promise<Category | null> {
    const db = useDatabase()

    return await db.Category.findOne({
      where: { slug },
      transaction: options.transaction,
      include: {
        model: db.Category,
        as: 'children',
      },
    })
  },

  /**
   * Finds a category by their slug or fail.
   *
   * @param slug - category slug
   * @param options - sequelize options
   * @returns Category instance or null if not found
   * @throws - if category is not exists
   */
  async findBySlugOrFail(slug: string, options: Options = {}): Promise<Category> {
    const category = await categoryRepository.findBySlug(slug, options)

    if (!category) {
      throw createError({
        message: 'Категорію не знайдено',
        status: 404,
      })
    }

    return category
  },

  /**
   * Finds categories by their parent id.
   *
   * @param parentId - category slug
   * @param options - sequelize options
   * @returns array of categories with given parent id
   */
  async findAllByParentId(parentId: number | null, options: Options = {}): Promise<Category[]> {
    const db = useDatabase()

    return await db.Category.findAll({
      where: { parentId },
      transaction: options.transaction,
    })
  },

  /**
   * Finds categories by their parent id.
   *
   * @param path - category path
   * @param options - sequelize options
   * @returns array of categories with given parent id
   */
  async countLotsByPath(path: string, options: Options = {}): Promise<number> {
    const db = useDatabase()

    return await db.Lot.count({
      transaction: options.transaction,
      include: [{
        model: db.Category,
        as: 'category',
        where: {
          path: {
            [Op.like]: `${path}%`,
          },
        },
        required: true,
        attributes: [],
      }],
    })
  },

  /**
   * Update category paths for category and its descendants.
   *
   * @param oldPath - old category path
   * @param newPath - new category path
   * @param options - sequelize options
   */
  async updatePaths(oldPath: string, newPath: string, options: Options = {}) {
    const db = useDatabase()
    const updateQuery = `
      UPDATE "${db.sequelize.models.Category.tableName}"
      SET path = REPLACE(path, :oldPathPrefix, :newPathPrefix)
      WHERE path LIKE :oldPathLike;
    `

    await db.sequelize.query(updateQuery, {
      replacements: {
        oldPathPrefix: oldPath,
        newPathPrefix: newPath,
        oldPathLike: `${oldPath}%`,
      },
      type: QueryTypes.UPDATE,
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
  async create(fields: CategoryAttributesOptional, options: Options = {}): Promise<Category> {
    const db = useDatabase()

    const category = await db.Category.create(
      fields,
      { transaction: options.transaction },
    )

    return category
  },

  /**
   * Save a changed category in the database.
   *
   * @param category - category instance
   * @param options - sequelize options
   */
  async save(category: Category, options: Options = {}) {
    return await category.save({ transaction: options.transaction })
  },

  /**
   * Creates a new category record in the database.
   *
   * @param id - category primary key
   * @param options - sequelize options
   * @returns category instance
   */
  async destory(id: number, options: Options = {}) {
    const db = useDatabase()

    return await db.Category.destroy({
      where: { id },
      transaction: options.transaction,
    })
  },
}
