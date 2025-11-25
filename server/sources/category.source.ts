import type { Category } from '../database'
import type { SourceInvalidateParams } from '../types/sources'
import { categoryRepository } from '../repositories/category.repository'

const SCOPE = 'cat'

const keys = {
  all: `${SCOPE}:*`,
  tree: `${SCOPE}:tree`,
  one: (id: number) => `${SCOPE}:id:${id}`,
  slug: (slug: string) => `${SCOPE}:slug:${slug}`,
  children: (id: number) => `${SCOPE}:children:${id}`,
  breadcrumbs: (path: string) => `${SCOPE}:crumbs:${path}`,
}

export const categorySource = {
  /**
   * Retrieves root categories, utilizing Redis caching.
   *
   * @returns array of category instances
   */
  async getRoot() {
    const db = useDatabase()

    return await useDatabaseCache(keys.tree, db.Category, async () => {
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
    const key = keys.one(id)

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
    const key = keys.slug(slug)

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
    const key = keys.children(id)

    return await useDatabaseCache(key, db.Category, async () => {
      return await categoryRepository.findAllByParentId(id)
    })
  },

  /**
   * Retrieves a categories path by id, utilizing Redis caching.
   *
   * @param id category primary key
   * @returns array of category instance
   */
  async getBreadcrumbsById(id: number) {
    const db = useDatabase()

    const category = await categorySource.getById(id)

    const key = keys.breadcrumbs(category.path)

    return await useDatabaseCache(key, db.Category, async () => {
      const ids = category.path.split('/').map(id => Number(id))

      const categories = await categoryRepository.findByIds(ids)

      if (categories.length !== ids.length) {
        throw createError({
          message: 'Категорія була змінена або видалена',
          status: 500,
        })
      }

      categories.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id))

      return categories
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
    const key = keys.breadcrumbs(path)

    return await useDatabaseCache(key, db.Category, async () => {
      const ids = path.split('/').map(id => Number(id))

      const categories = await categoryRepository.findByIds(ids)

      if (categories.length !== ids.length) {
        throw createError({
          message: 'Категорія була змінена або видалена',
          status: 500,
        })
      }

      categories.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id))

      return categories
    })
  },

  /**
   * Clears cache for a category.
   *
   * @param instance category instance or array of category instances
   */
  async invalidate(instance: SourceInvalidateParams<Category>) {
    const db = useDatabase()
    const redis = useRedis()
    const categories = Array.isArray(instance) ? instance : [instance]
    const keysForDelete = new Set<string>()

    for (const category of categories) {
      if (!category || !(category instanceof db.Category))
        continue

      keysForDelete.add(keys.one(category.id))
      keysForDelete.add(keys.slug(category.slug))

      if (category.parentId)
        keysForDelete.add(keys.children(category.parentId))

      if (category.parentId === null)
        keysForDelete.add(keys.tree)
    }

    const cachedBreadcrumbsKeys = await redis.keys(
      keys.breadcrumbs(`*`),
    )

    for (const key of cachedBreadcrumbsKeys) {
      keysForDelete.add(key)
    }

    await redis.del([...keysForDelete])
  },

  /**
   * Invalidates all category-related cache entries.
   */
  async invalidateAll() {
    const redis = useRedis()
    const keysForDelete = await redis.keys(keys.all)
    if (keysForDelete.length > 0) {
      await redis.del(keysForDelete)
    }
  },
}
