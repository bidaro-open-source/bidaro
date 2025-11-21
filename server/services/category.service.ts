import type { Category, CategoryAttributesOptional } from '../database'
import { v4 as uuidv4 } from 'uuid'
import { categoryRepository } from '../repositories/category.repository'

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
   * @param instance category instance or array of category instances
   */
  async clearCache(instance: (Category | null) | (Category | null)[]) {
    const redis = useRedis()
    const categories = Array.isArray(instance) ? instance : [instance]
    const keys = new Set<string>()

    for (const category of categories) {
      if (!category)
        continue

      keys.add(cacheKeys.byId(category.id))
      keys.add(cacheKeys.bySlug(category.slug))

      if (category.parentId)
        keys.add(cacheKeys.childrenById(category.parentId))

      if (category.parentId === null)
        keys.add(cacheKeys.root)
    }

    const cachedBreadcrumbsKeys = await redis.keys(
      cacheKeys.breadcrumbsByPath(`*`),
    )

    for (const key of cachedBreadcrumbsKeys) {
      keys.add(key)
    }

    await redis.del([...keys])
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
   * @returns array of category instances
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
        ids.map(async (id) => {
          const category = await categoryRepository.findById(Number(id))

          if (!category) {
            throw createError({
              message: 'Категорія була змінена або видалена',
              status: 500,
            })
          }

          return category
        }),
      )
    })
  },

  /**
   * Creates a new category.
   *
   * @param data - category data
   * @returns category instance
   */
  async create(data: Omit<CategoryAttributesOptional, 'path'>) {
    return await useDatabaseTransaction(async (transaction) => {
      const categoryBySlug = await categoryRepository.findBySlug(data.slug, { transaction })

      if (categoryBySlug) {
        throw createError({
          statusCode: 422,
          message: 'Слаг вже зайнят',
        })
      }

      let parentCategory: Category | null = null

      if (data.parentId) {
        parentCategory = await categoryRepository.findById(data.parentId, { transaction })

        if (!parentCategory) {
          throw createError({
            message: 'Батьківську категорію не знайдено',
            status: 422,
          })
        }
      }

      const category = await categoryRepository.create({
        parentId: null,
        path: uuidv4(),
        ...data,
      }, { transaction })

      const parentId = parentCategory ? parentCategory.id : null
      const path = parentCategory
        ? `${parentCategory.path}/${category.id}`
        : `${category.id}`

      const updatedCategory = await categoryRepository.updateById(
        category.id,
        { parentId, path },
        { transaction },
      )

      transaction.afterCommit(async () => {
        await categoryService.clearCache(updatedCategory)
      })

      return updatedCategory
    })
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
    return await useDatabaseTransaction(async (transaction) => {
      const category = await categoryRepository.findByIdWithLock(id, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      })

      if (!category) {
        throw createError({
          message: 'Категорію не знайдено',
          status: 404,
        })
      }

      const displayName = data.displayName ?? category.displayName
      const description = Object.hasOwn(data, 'description')
        ? data.description
        : category.description

      const updatedCategory = await categoryRepository.updateById(
        category.id,
        {
          displayName,
          description: description || null,
        },
        { transaction },
      )

      transaction.afterCommit(async () => {
        await categoryService.clearCache(updatedCategory)
      })

      return updatedCategory
    })
  },

  /**
   * Updates category slug.
   *
   * @param id - category primary key
   * @param slug - new category slug
   * @returns updated category instance
   * @throws 404 if the category does not exist
   * @throws 422 if the slug is already taken
   */
  async updateSlug(id: number, slug: string) {
    return await useDatabaseTransaction(async (transaction) => {
      const category = await categoryRepository.findByIdWithLock(id, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      })

      if (!category) {
        throw createError({
          message: 'Категорію не знайдено',
          status: 404,
        })
      }

      if (category.slug === slug) {
        return category
      }

      const categoryBySlug = await categoryRepository.findBySlug(slug, { transaction })

      if (categoryBySlug) {
        throw createError({
          statusCode: 422,
          message: 'Слаг вже зайнят',
        })
      }

      const updatedCategory = await categoryRepository.updateById(
        category.id,
        { slug },
        { transaction },
      )

      transaction.afterCommit(async () => {
        await categoryService.clearCache([category, updatedCategory])
      })

      return updatedCategory
    })
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
    return await useDatabaseTransaction(async (transaction) => {
      const category = await categoryRepository.findByIdWithLock(id, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      })

      if (!category) {
        throw createError({
          message: 'Категорію не знайдено',
          status: 404,
        })
      }

      if (category.parentId === parentId) {
        return category
      }

      const children = await categoryRepository.findAllByPathWithLock(category.path, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      })

      let parentCategory: Category | null = null

      if (parentId) {
        parentCategory = await categoryRepository.findById(parentId, { transaction })

        if (!parentCategory) {
          throw createError({
            message: 'Батьківську категорію не знайдено',
            status: 422,
          })
        }

        if (parentCategory.path.split('/').map(Number).includes(id)) {
          throw createError({
            message: 'Батьківська категорія не може бути нащадком цієї категорії',
            status: 422,
          })
        }
      }

      const oldPath = category.path
      const newPath = parentCategory
        ? `${parentCategory.path}/${category.id}`
        : `${category.id}`

      await categoryRepository.updatePaths(oldPath, newPath, { transaction })

      const updatedCategory = await categoryRepository.updateById(
        category.id,
        {
          path: newPath,
          parentId,
        },
        { transaction },
      )

      transaction.afterCommit(async () => {
        await categoryService.clearCache([
          category,
          updatedCategory,
          parentCategory,
          ...children,
        ])
      })

      return updatedCategory
    })
  },

  /**
   * Deletes a category.
   *
   * @param id - The ID of the category to delete
   * @throws 400 if the category has children or lots
   * @throws 404 if the category does not exist
   */
  async delete(id: number) {
    return await useDatabaseTransaction(async (transaction) => {
      const category = await categoryRepository.findByIdWithLock(id, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      })

      if (!category) {
        throw createError({
          statusCode: 404,
          message: 'Категорію не знайдено',
        })
      }

      const children = await categoryRepository.findAllByParentId(category.id, { transaction })

      if (children.length > 0) {
        throw createError({
          statusCode: 400,
          message: 'Не можна видалити категорію, яка має дочірні категорії',
        })
      }

      const lotsCount = await categoryRepository.countLotsByPath(category.path, { transaction })

      if (lotsCount > 0) {
        throw createError({
          statusCode: 400,
          message: 'Не можна видалити категорію, яка має лоти',
        })
      }

      await categoryRepository.destroyById(category.id, { transaction })

      transaction.afterCommit(async () => {
        await categoryService.clearCache(category)
      })
    })
  },
}
