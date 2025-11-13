import type { Transaction } from 'sequelize'
import type { Category, CategoryAttributesOptional } from '../database/models/Category'

interface Options {
  transaction?: Transaction
}

const REDIS_CATEGORY_DESCENDANTS_NAMESPACE = 'category:descendants'
const REDIS_CATEGORY_LOT_COUNT_NAMESPACE = 'category:lot-count'
const LOT_COUNT_TTL = 600 // 10 minutes in seconds

/**
 * Invalidates all cached category descendant IDs
 */
async function invalidateCategoryDescendantsCache() {
  const redis = useRedis()
  const keys = await redis.keys(`${REDIS_CATEGORY_DESCENDANTS_NAMESPACE}:*`)
  if (keys.length > 0) {
    await redis.del(...keys)
  }
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
      include: createNestedInclude(3), // Support up to 3 levels of nesting
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
      include: createNestedInclude(3), // Support up to 3 levels of nesting
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
      include: createNestedInclude(3), // Support up to 3 levels of nesting
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

    await invalidateCategoryDescendantsCache()

    return category
  },

  /**
   * Save a changed category in the database.
   *
   * @param category - category instance
   * @param options - sequelize options
   */
  async save(category: Category, options: Options = {}) {
    const result = await category.save({ transaction: options.transaction })
    await invalidateCategoryDescendantsCache()
    return result
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

    const result = await db.Category.destroy({
      where: { id },
      transaction: options.transaction,
    })

    await invalidateCategoryDescendantsCache()

    return result
  },

  /**
   * Get all descendant category IDs for a given category ID (including the category itself)
   *
   * @param categoryId - category primary key
   * @param options - sequelize options
   * @returns array of category IDs
   */
  async getAllDescendantIds(categoryId: number, options: Options = {}): Promise<number[]> {
    const redis = useRedis()
    const cacheKey = `${REDIS_CATEGORY_DESCENDANTS_NAMESPACE}:${categoryId}`

    // Try to get from cache
    const cached = await redis.get(cacheKey)
    if (cached) {
      return JSON.parse(cached)
    }

    // Calculate descendant IDs
    const db = useDatabase()
    const categoryIds: number[] = [categoryId]
    const queue: number[] = [categoryId]

    while (queue.length > 0) {
      const currentId = queue.shift()!
      const children = await db.Category.findAll({
        where: { parentId: currentId },
        attributes: ['id'],
        transaction: options.transaction,
      })

      for (const child of children) {
        categoryIds.push(child.id)
        queue.push(child.id)
      }
    }

    // Cache with no expiration (eternal TTL)
    await redis.set(cacheKey, JSON.stringify(categoryIds))

    return categoryIds
  },

  /**
   * Count lots for a category and all its descendants
   *
   * @param categoryId - category primary key
   * @param options - sequelize options
   * @returns count of lots
   */
  async countLotsForCategoryTree(categoryId: number, options: Options = {}): Promise<number> {
    const redis = useRedis()
    const cacheKey = `${REDIS_CATEGORY_LOT_COUNT_NAMESPACE}:${categoryId}`

    // Try to get from cache
    const cached = await redis.get(cacheKey)
    if (cached !== null) {
      return parseInt(cached, 10)
    }

    // Calculate lot count
    const db = useDatabase()
    const categoryIds = await categoryRepository.getAllDescendantIds(categoryId, options)

    const count = await db.Lot.count({
      where: {
        categoryId: categoryIds,
      },
      transaction: options.transaction,
    })

    // Cache with 10 minutes TTL
    await redis.setex(cacheKey, LOT_COUNT_TTL, count.toString())

    return count
  },
}
