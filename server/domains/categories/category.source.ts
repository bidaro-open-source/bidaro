import type { Category } from '#database'
import { EntitySource } from '#class/EntitySource'
import { categoryRepository } from './category.repository'

class CategorySource extends EntitySource<Category> {
  readonly scope = 'cat'

  get keys() {
    return {
      tree: `${this.scope}:tree`,
      one: (id: number) => `${this.scope}:id:${id}`,
      slug: (slug: string) => `${this.scope}:slug:${slug}`,
      children: (id: number) => `${this.scope}:children:${id}`,
      breadcrumbs: (path: string) => `${this.scope}:crumbs:${path}`,
      tag: (id: number) => `${this.scope}:tags:${id}`,
    }
  }

  getEntityKeys(category: Category): string[] {
    return [
      this.keys.one(category.id),
      this.keys.slug(category.slug),
      ...(category.parentId ? [this.keys.children(category.parentId)] : []),
      ...(category.parentId === null ? [this.keys.tree] : []),
    ]
  }

  getEntityTags(category: Category): string[] {
    return [
      this.keys.tag(category.id),
    ]
  }

  /**
   * Retrieve root categories, using Redis caching.
   *
   * @returns Array of root category instances
   */
  async getRoot() {
    return await useDatabaseCache(this.keys.tree, async () => {
      return await categoryRepository.findAllByParentId(null)
    })
  }

  /**
   * Retrieve a category by ID, using Redis caching.
   *
   * @param id - Category primary key
   * @throws 404 if the category does not exist
   * @returns The category instance
   */
  async getById(id: number) {
    const key = this.keys.one(id)

    return await useDatabaseCache(key, async () => {
      const data = await categoryRepository.findByPk(id)

      if (!data) {
        throw createError({
          message: 'Категорію не знайдено',
          status: 404,
        })
      }

      return data
    })
  }

  /**
   * Retrieve a category by slug, using Redis caching.
   *
   * @param slug - Category slug
   * @throws 404 if the category does not exist
   * @returns The category instance
   */
  async getBySlug(slug: string) {
    const key = this.keys.slug(slug)

    return await useDatabaseCache(key, async () => {
      const data = await categoryRepository.findBySlug(slug)

      if (!data) {
        throw createError({
          message: 'Категорію не знайдено',
          status: 404,
        })
      }

      return data
    })
  }

  /**
   * Retrieve the children of a category by ID, using Redis caching.
   *
   * @param id - Parent category ID
   * @returns Array of child category instances
   */
  async getChildrenById(id: number) {
    const key = this.keys.children(id)

    return await useDatabaseCache(key, async () => {
      return await categoryRepository.findAllByParentId(id)
    })
  }

  /**
   * Retrieve the breadcrumb categories for a given category ID, using Redis caching.
   *
   * @param id - Category primary key
   * @throws 500 if one or more categories in the path are missing
   * @returns Ordered array of categories representing the breadcrumb path
   */
  async getBreadcrumbsById(id: number) {
    const category = await this.getById(id)

    return await useDatabaseCache(
      this.keys.breadcrumbs(category.path),
      async () => {
        const ids = category.path.split('/').map(id => Number(id))

        const categories = await categoryRepository.findByPks(ids)

        if (categories.length !== ids.length) {
          throw createError({
            message: 'Категорія була змінена або видалена',
            status: 500,
          })
        }

        categories.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id))

        return categories
      },
      (categories) => {
        return categories.map(cat => this.keys.tag(cat.id))
      },
    )
  }

  /**
   * Retrieve the breadcrumb categories for a given category path, using Redis caching.
   *
   * @param path - Category path string (e.g. "1/2/3")
   * @throws 500 if one or more categories in the path are missing
   * @returns Ordered array of categories representing the breadcrumb path
   */
  async getBreadcrumbsByPath(path: string) {
    return await useDatabaseCache(
      this.keys.breadcrumbs(path),
      async () => {
        const ids = path.split('/').map(id => Number(id))

        const categories = await categoryRepository.findByPks(ids)

        if (categories.length !== ids.length) {
          throw createError({
            message: 'Категорія була змінена або видалена',
            status: 500,
          })
        }

        categories.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id))

        return categories
      },
      (categories) => {
        return categories.map(cat => this.keys.tag(cat.id))
      },
    )
  }
}

export const categorySource = new CategorySource()
