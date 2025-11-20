import type { Transaction } from 'sequelize'
import type { Category, CategoryAttributesOptional } from '../database'
import { v4 as uuidv4 } from 'uuid'
import { categoryRepository } from '../repositories/category.repository'

interface Options {
  transaction?: Transaction
}

const cacheKeys = {
  root: 'categories:root',
  byId: (id: number) => `categories:id:${id}`,
  bySlug: (slug: string) => `categories:slug:${slug}`,
  childrenById: (id: number) => `categories:children:id:${id}`,
  breadcrumbsByPath: (path: string) => `categories:breadcrumbs:${path}`,
}

export const categoryService = {
  /**
   * Clears cache for a category.
   *
   * @param category category instance
   */
  async clearCache(category: Category) {
    const redis = useRedis()

    const keys = [
      cacheKeys.byId(category.id),
      cacheKeys.bySlug(category.slug),
    ]

    if (category.parentId === null) {
      keys.push(cacheKeys.root)
    }
    else {
      keys.push(cacheKeys.childrenById(category.parentId))
    }

    const cachedBreadcrumbsKeys = await redis.keys(
      cacheKeys.breadcrumbsByPath(`*`),
    )

    keys.push(...cachedBreadcrumbsKeys)

    await redis.del(keys)
  },

  /**
   * Retrieves root categories, utilizing Redis caching.
   *
   * @returns array of category instances
   */
  async getRootCategories() {
    const db = useDatabase()

    const key = cacheKeys.root

    return await useDatabaseCache(key, db.Category, async () => {
      return await categoryRepository.findAllByParentId(null)
    })
  },

  /**
   * Retrieves a category by ID, utilizing Redis caching.
   *
   * @throws 404 if the category does not exist
   * @returns category instance
   */
  async getById(id: number) {
    const db = useDatabase()
    const key = cacheKeys.byId(id)

    return await useDatabaseCache(key, db.Category, async () => {
      const data = await categoryRepository.findById(id)

      if (!data) {
        throw createError({
          message: 'Категорію не знайдено',
          status: 404,
        })
      }

      return data
    })
  },

  /**
   * Retrieves a category by slug, utilizing Redis caching.
   *
   * @throws 404 if the category does not exist
   * @returns category instance
   */
  async getBySlug(slug: string) {
    const db = useDatabase()
    const key = cacheKeys.bySlug(slug)

    return await useDatabaseCache(key, db.Category, async () => {
      const data = await categoryRepository.findBySlug(slug)

      if (!data) {
        throw createError({
          message: 'Категорію не знайдено',
          status: 404,
        })
      }

      return data
    })
  },

  /**
   * Retrieves a category childrens by ID, utilizing Redis caching.
   *
   * @throws 404 if the category does not exist
   * @returns category instance
   */
  async getChildrenById(id: number) {
    const db = useDatabase()
    const key = cacheKeys.childrenById(id)

    return await useDatabaseCache(key, db.Category, async () => {
      return await categoryRepository.findAllByParentId(id)
    })
  },

  /**
   * Retrieves a categories from path, utilizing Redis caching.
   *
   * @param path category path
   * @returns array of category instance
   */
  async getBreadcrumbsByPath(path: string) {
    const db = useDatabase()
    const key = cacheKeys.breadcrumbsByPath(path)

    return await useDatabaseCache(key, db.Category, async () => {
      const ids = path.split('/')

      return await Promise.all(
        ids.map(id => categoryService.findByIdOrFail(Number(id))),
      )
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
  async findByIdOrFail(id: number, options: Options = {}) {
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
   * Creates a new category.
   *
   * @param data - category data
   * @returns category instance
   */
  async create(data: Omit<CategoryAttributesOptional, 'path'>) {
    const categoryBySlug = await categoryRepository.findBySlug(data.slug)

    if (categoryBySlug) {
      throw createError({
        statusCode: 422,
        message: 'Слаг вже зайнят',
      })
    }

    const transaction = await useDatabaseTransaction()

    let parentCategory: Category | null = null

    if (data.parentId) {
      parentCategory = await categoryRepository.findById(data.parentId, { transaction })

      if (!parentCategory) {
        await transaction.rollback()
        throw createError({
          message: 'Батьківську категорію не знайдено',
          status: 422,
        })
      }
    }

    try {
      const category = await categoryRepository.create({
        parentId: undefined,
        path: uuidv4(),
        ...data,
      }, { transaction })

      category.parentId = parentCategory ? parentCategory.id : null
      category.path = parentCategory
        ? `${parentCategory.path}/${category.id}`
        : `${category.id}`

      await categoryRepository.save(category, { transaction })

      await transaction.commit()

      await categoryService.clearCache(category)

      return category
    }
    catch (error) {
      await transaction.rollback()

      throw createError({
        statusCode: 500,
        statusMessage: 'Unprocessable Content',
        message: 'Невідома помилка під час створення категорії',
        data: error,
      })
    }
  },

  /**
   * Updates a category.
   *
   * @param id - The ID of the category to update
   * @param data - The data to update
   * @returns The updated category instance
   * @throws 404 if the category does not exist
   */
  async update(id: number, data: Partial<Pick<CategoryAttributesOptional, 'displayName' | 'description'>>) {
    const transaction = await useDatabaseTransaction()

    const category = await categoryRepository.findByIdWithLock(id, {
      lock: transaction.LOCK.UPDATE,
      transaction,
    })

    if (!category) {
      await transaction.rollback()
      throw createError({
        message: 'Категорію не знайдено',
        status: 404,
      })
    }

    try {
      category.displayName = data.displayName ?? category.displayName
      category.description = data.description ?? category.description

      const updatedCategory = await categoryRepository.save(category, { transaction })

      await transaction.commit()

      await categoryService.clearCache(updatedCategory)

      return updatedCategory
    }
    catch (error) {
      await transaction.rollback()

      throw createError({
        statusCode: 500,
        statusMessage: 'Unprocessable Content',
        message: 'Невідома помилка під час оновлення категорії',
        data: error,
      })
    }
  },

  /**
   * Updates category paths when parent changes.
   *
   * @param id - category primary key
   * @param slug - new category slug
   * @returns updated category instance
   * @throws 404 if the category does not exist
   * @throws 422 if the slug is already taken
   */
  async updateSlug(id: number, slug: string) {
    const transaction = await useDatabaseTransaction()

    const category = await categoryRepository.findByIdWithLock(id, {
      lock: transaction.LOCK.UPDATE,
      transaction,
    })

    if (!category) {
      await transaction.rollback()
      throw createError({
        message: 'Категорію не знайдено',
        status: 404,
      })
    }

    if (category.slug === slug) {
      await transaction.commit()
      return category
    }

    const categoryBySlug = await categoryRepository.findBySlug(slug)

    if (categoryBySlug) {
      await transaction.rollback()
      throw createError({
        statusCode: 422,
        message: 'Слаг вже зайнят',
      })
    }

    try {
      await categoryService.clearCache(category)

      category.slug = slug

      const updatedCategory = await categoryRepository.save(category, { transaction })

      await transaction.commit()

      return updatedCategory
    }
    catch (error) {
      await transaction.rollback()

      throw createError({
        statusCode: 500,
        statusMessage: 'Unprocessable Content',
        message: 'Невідома помилка під час оновлення слагу категорії',
        data: error,
      })
    }
  },

  /**
   * Updates category parent.
   *
   * @param id - category primary key
   * @param parentId - parent category id or null
   * @returns updated category instance
   * @throws 404 if the category does not exist
   * @throws 422 if the parent category does not exist
   * @throws 422 if the parent category is a child of the category itself
   */
  async updateParent(id: number, parentId: number | null) {
    const transaction = await useDatabaseTransaction()

    const category = await categoryRepository.findByIdWithLock(id, {
      lock: transaction.LOCK.UPDATE,
      transaction,
    })

    if (!category) {
      await transaction.rollback()
      throw createError({
        message: 'Категорію не знайдено',
        status: 404,
      })
    }

    if (category.parentId === parentId) {
      await transaction.commit()
      return category
    }

    let parentCategory: Category | null = null

    if (parentId) {
      parentCategory = await categoryRepository.findById(parentId, { transaction })

      if (!parentCategory) {
        await transaction.rollback()
        throw createError({
          message: 'Батьківську категорію не знайдено',
          status: 422,
        })
      }

      if (parentCategory.path.split('/').map(Number).includes(id)) {
        await transaction.rollback()
        throw createError({
          message: 'Батьківська категорія не може бути нащадком цієї категорії',
          status: 422,
        })
      }
    }

    try {
      const oldPath = category.path
      const newPath = parentCategory
        ? `${parentCategory.path}/${category.id}`
        : `${category.id}`

      category.path = newPath
      category.parentId = parentId

      await categoryRepository.updatePaths(oldPath, newPath, { transaction })

      const updatedCategory = await categoryRepository.save(category, { transaction })

      await transaction.commit()

      await categoryService.clearCache(category)

      if (parentCategory) {
        await categoryService.clearCache(parentCategory)
      }

      return updatedCategory
    }
    catch (error) {
      await transaction.rollback()

      throw createError({
        statusCode: 500,
        statusMessage: 'Unprocessable Content',
        message: 'Невідома помилка під час оновлення батьківської категорії',
        data: error,
      })
    }
  },

  /**
   * Deletes a category.
   *
   * @param id - The ID of the category to delete
   * @throws 400 if the category has children or lots
   * @throws 404 if the category does not exist
   */
  async delete(id: number) {
    const transaction = await useDatabaseTransaction()

    const category = await categoryRepository.findByIdWithLock(id, {
      lock: transaction.LOCK.UPDATE,
      transaction,
    })

    if (!category) {
      await transaction.rollback()
      throw createError({
        statusCode: 404,
        message: 'Категорію не знайдено',
      })
    }

    const children = await categoryRepository.findAllByParentId(category.id, { transaction })

    if (children.length > 0) {
      await transaction.rollback()
      throw createError({
        statusCode: 400,
        message: 'Не можна видалити категорію, яка має дочірні категорії',
      })
    }

    const lotsCount = await categoryRepository.countLotsByPath(category.path, { transaction })

    if (lotsCount > 0) {
      await transaction.rollback()
      throw createError({
        statusCode: 400,
        message: 'Не можна видалити категорію, яка має лоти',
      })
    }

    try {
      await categoryRepository.destroy(category.id, { transaction })

      await transaction.commit()

      await categoryService.clearCache(category)
    }
    catch (error) {
      await transaction.rollback()

      throw createError({
        statusCode: 500,
        statusMessage: 'Unprocessable Content',
        message: 'Невідома помилка під час видалення категорії',
        data: error,
      })
    }
  },
}
