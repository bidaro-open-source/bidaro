import type { LOCK, Transaction } from 'sequelize'
import type { Category, CategoryAttributesOptional } from '../../database/models/Category'
import { Op, QueryTypes } from 'sequelize'

interface Options {
  lock?: LOCK
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
   * Finds categories by their primary keys.
   *
   * @param ids - array of category primary key
   * @param options - sequelize options
   * @returns Array of category instances
   */
  async findByIds(ids: number[], options: Options = {}) {
    const db = useDatabase()

    return db.Category.findAll({
      transaction: options.transaction,
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    })
  },

  /**
   * Finds a category by their primary key.
   *
   * @param id - category primary key
   * @param options - sequelize options
   * @returns Category instance or null if not found
   */
  async findByIdWithLock(id: number, options: Required<Options>) {
    const db = useDatabase()

    return db.Category.findByPk(id, {
      lock: options.lock,
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
   * Finds a categories by their path.
   *
   * @param path - category path
   * @param options - sequelize options
   * @returns array of category instances
   */
  async findAllByPathWithLock(path: string, options: Required<Options>) {
    const db = useDatabase()

    return await db.Category.findAll({
      lock: options.lock,
      transaction: options.transaction,
      where: {
        path: {
          [Op.like]: `${path}%`,
        },
      },
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
   * Updates a category by their primary key.
   *
   * @param id - category primary key
   * @param fields - fields to update
   * @param options - sequelize options
   * @returns updated category instance
   */
  async updateById(
    id: number,
    fields: Partial<Category>,
    options: Options = {},
  ) {
    const db = useDatabase()

    const [_, [category]] = await db.Category.update(
      fields,
      {
        where: { id },
        transaction: options.transaction,
        returning: true,
      },
    )

    return category
  },

  /**
   * Creates a new category record in the database.
   *
   * @param id - category primary key
   * @param options - sequelize options
   * @returns category instance
   */
  async destroyById(id: number, options: Options = {}) {
    const db = useDatabase()

    return await db.Category.destroy({
      where: { id },
      transaction: options.transaction,
    })
  },
}
