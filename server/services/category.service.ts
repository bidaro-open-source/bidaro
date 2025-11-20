import type { Transaction } from 'sequelize'
import type { Category, CategoryAttributesOptional } from '../database'
import { v4 as uuidv4 } from 'uuid'
import z from 'zod'
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
   * Checks if a category slug is unique.
   *
   * @param slug - The slug to check for uniqueness
   * @throws 422 if the slug is already taken
   * @returns The category instance if found
   */
  async checkSlugUnique(slug: string) {
    const categoryBySlug = await categoryRepository.findBySlug(slug)

    if (categoryBySlug) {
      const issues: z.ZodIssue[] = [{
        code: 'custom',
        path: ['slug'],
        message: 'Слаг вже зайнят',
      }]

      throw createError({
        statusCode: 422,
        message: 'Неправильні дані запиту',
        data: new z.ZodError(issues).flatten(),
      })
    }
  },

  /**
   * Checks if a category parent exists.
   *
   * @param parentId - The ID of the parent category to check
   * @throws 422 if the parent category does not exist
   * @returns The parent category instance
   */
  async checkParentExists(parentId: number) {
    const parentCategory = await categoryRepository.findById(parentId)

    if (!parentCategory) {
      const issues: z.ZodIssue[] = [{
        code: 'custom',
        path: ['parentId'],
        message: 'Батьківська категорія не знайдена',
      }]

      throw createError({
        statusCode: 422,
        message: 'Неправильні дані запиту',
        data: new z.ZodError(issues).flatten(),
      })
    }
  },

  /**
   * Checks that the parent category is not a child of the category itself.
   *
   * @param id - The ID of the category
   * @param parentId - The ID of the parent category
   * @throws 422 if the parent category is a child of the category itself
   * @returns The parent category instance
   */
  async checkParentIsNotChildren(id: number, parentId: number) {
    const parentCategory = await categoryService.findByIdOrFail(parentId)

    if (parentCategory.path.split('/').map(Number).includes(id)) {
      const issues: z.ZodIssue[] = [{
        code: 'custom',
        path: ['parentId'],
        message: 'Батьківська категорія не може бути нащадком цієї категорії',
      }]

      throw createError({
        statusCode: 422,
        message: 'Неправильні дані запиту',
        data: new z.ZodError(issues).flatten(),
      })
    }
  },

  /**
   * Creates a new category.
   *
   * @param data - category data
   * @returns category instance
   */
  async create(data: Omit<CategoryAttributesOptional, 'path'>) {
    await categoryService.checkSlugUnique(data.slug)

    if (typeof data.parentId === 'number') {
      await categoryService.checkParentExists(data.parentId)
    }

    const transaction = await useDatabaseTransaction()

    try {
      const parentCategory = data.parentId
        ? await categoryRepository.findById(data.parentId, { transaction })
        : null

      const category = await categoryRepository.create({
        ...data,
        parentId: undefined,
        path: uuidv4(),
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

    const category = await categoryRepository.findById(id, { transaction })

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

    const category = await categoryRepository.findById(id, { transaction })

    if (!category) {
      await transaction.rollback()
      throw createError({
        message: 'Категорію не знайдено',
        status: 404,
      })
    }

    try {
      if (slug && slug !== category.slug) {
        await categoryService.checkSlugUnique(slug)
        await categoryService.clearCache(category)
        category.slug = slug
      }

      const updatedCategory = await categoryRepository.save(category, { transaction })

      await transaction.commit()

      return updatedCategory
    }
    catch (error) {
      await transaction.rollback()
      throw error
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

    const category = await categoryRepository.findById(id, { transaction })

    if (!category) {
      await transaction.rollback()
      throw createError({
        message: 'Категорію не знайдено',
        status: 404,
      })
    }

    try {
      const parentIsPassed = typeof parentId === 'number' || typeof parentId === 'object'
      const parentIsSame = parentId === category.parentId
      const parentIsId = typeof parentId === 'number'

      if (parentIsPassed && !parentIsSame) {
        let parentCategory: Category | null = null

        if (parentIsId) {
          await categoryService.checkParentExists(parentId as number)
          await categoryService.checkParentIsNotChildren(category.id, parentId as number)
          parentCategory = await categoryRepository.findById(parentId as number, { transaction })
        }

        const oldPath = category.path
        const newPath = parentCategory
          ? `${parentCategory.path}/${category.id}`
          : `${category.id}`

        category.path = newPath
        category.parentId = parentIsId ? parentId as number : null

        await categoryRepository.updatePaths(oldPath, newPath, { transaction })
      }

      const updatedCategory = await categoryRepository.save(category, { transaction })

      await transaction.commit()

      await categoryService.clearCache(category)

      return updatedCategory
    }
    catch (error) {
      await transaction.rollback()
      throw error
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
    const category = await categoryService.findByIdOrFail(id)

    const children = await categoryRepository.findAllByParentId(category.id)

    if (children.length > 0) {
      throw createError({
        statusCode: 400,
        message: 'Не можна видалити категорію, яка має дочірні категорії',
      })
    }

    const lotsCount = await categoryRepository.countLotsByPath(category.path)

    if (lotsCount > 0) {
      throw createError({
        statusCode: 400,
        message: 'Не можна видалити категорію, яка має лоти',
      })
    }

    await categoryRepository.destroy(category.id)

    await categoryService.clearCache(category)
  },
}
