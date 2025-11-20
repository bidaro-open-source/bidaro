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
  async findById(id: number, options: Options = {}) {
    const db = useDatabase()

    return db.Category.findByPk(id, {
      transaction: options.transaction,
    })
  },

  /**
   * Finds a category by their slug.
   *
   * @param slug - category slug
   * @param options - sequelize options
   * @returns Category instance or null if not found
   */
  async findBySlug(slug: string, options: Options = {}) {
    const db = useDatabase()

    return await db.Category.findOne({
      where: { slug },
      transaction: options.transaction,
    })
  },

  /**
   * Finds categories by their parent id.
   *
   * @param parentId - category parent id
   * @param options - sequelize options
   * @returns array of categories with given parent id
   */
  async findAllByParentId(parentId: number | null, options: Options = {}) {
    const db = useDatabase()

    return await db.Category.findAll({
      where: { parentId },
      transaction: options.transaction,
    })
  },

  /**
   * Counts lots for a category and all its descendants by path.
   *
   * @param path - category path (prefix to match categories and their descendants)
   * @param options - sequelize options
   * @returns number of lots for the category and its descendants
   */
  async countLotsByPath(path: string, options: Options = {}) {
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
  async create(fields: CategoryAttributesOptional, options: Options = {}) {
    const db = useDatabase()

    return await db.Category.create(
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
  async destroy(id: number, options: Options = {}) {
    const db = useDatabase()

    return await db.Category.destroy({
      where: { id },
      transaction: options.transaction,
    })
  },
}
