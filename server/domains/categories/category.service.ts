import type { Category, CategoryAttributesOptional } from '#database'
import { v4 as uuidv4 } from 'uuid'
import { categoryRepository } from './category.repository'
import { categorySource } from './category.source'

class CategoryService {
  /**
   * Creates a new category.
   *
   * @param data - category data
   * @returns category instance
   * @throws CATEGORY_SLUG_TAKEN
   * @throws CATEGORY_PARENT_NOT_FOUND
   */
  async create(data: Omit<CategoryAttributesOptional, 'path'>) {
    return await useDatabaseTransaction(async (transaction) => {
      const categoryBySlug = await categoryRepository.findBySlug(data.slug, { transaction })

      if (categoryBySlug) {
        throw createAppError('CATEGORY_SLUG_TAKEN', { slug: data.slug })
      }

      let parentCategory: Category | null = null

      if (data.parentId) {
        parentCategory = await categoryRepository.findByPk(data.parentId, { transaction })

        if (!parentCategory) {
          throw createAppError('CATEGORY_PARENT_NOT_FOUND', { parentId: data.parentId })
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

      const updatedCategory = await categoryRepository.updateByPk(
        category.id,
        { parentId, path },
        { transaction },
      )

      useDatabaseAfterCommit(transaction, 'category.service.create', async () => {
        await categorySource.invalidate(updatedCategory)
      })

      return updatedCategory
    })
  }

  /**
   * Updates a category.
   *
   * @param id - The ID of the category to update
   * @param data - The data to update
   * @returns The updated category instance
   * @throws CATEGORY_NOT_FOUND
   */
  async update(id: number, data: Partial<Pick<CategoryAttributesOptional, 'displayName' | 'description'>>) {
    return await useDatabaseTransaction(async (transaction) => {
      const category = await categoryRepository.findByPk(id, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      })

      if (!category) {
        throw createAppError('CATEGORY_NOT_FOUND', { id })
      }

      const displayName = data.displayName ?? category.displayName
      const description = Object.hasOwn(data, 'description')
        ? data.description
        : category.description

      const updatedCategory = await categoryRepository.updateByPk(
        category.id,
        {
          displayName,
          description: description || null,
        },
        { transaction },
      )

      useDatabaseAfterCommit(transaction, 'category.service.update', async () => {
        await categorySource.invalidate(updatedCategory)
      })

      return updatedCategory
    })
  }

  /**
   * Updates category slug.
   *
   * @param id - category primary key
   * @param slug - new category slug
   * @returns updated category instance
   * @throws CATEGORY_NOT_FOUND
   * @throws CATEGORY_SLUG_TAKEN
   */
  async updateSlug(id: number, slug: string) {
    return await useDatabaseTransaction(async (transaction) => {
      const category = await categoryRepository.findByPk(id, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      })

      if (!category) {
        throw createAppError('CATEGORY_NOT_FOUND', { id })
      }

      if (category.slug === slug) {
        return category
      }

      const categoryBySlug = await categoryRepository.findBySlug(slug, { transaction })

      if (categoryBySlug) {
        throw createAppError('CATEGORY_SLUG_TAKEN', { slug })
      }

      const updatedCategory = await categoryRepository.updateByPk(
        category.id,
        { slug },
        { transaction },
      )

      useDatabaseAfterCommit(transaction, 'category.service.create_slug', async () => {
        await categorySource.invalidate([category, updatedCategory])
      })

      return updatedCategory
    })
  }

  /**
   * Updates category parent.
   *
   * @param id - category primary key
   * @param parentId - parent category id or null
   * @returns updated category instance
   * @throws CATEGORY_NOT_FOUND
   * @throws CATEGORY_PARENT_NOT_FOUND
   * @throws CATEGORY_PARENT_LOOP
   */
  async updateParent(id: number, parentId: number | null) {
    return await useDatabaseTransaction(async (transaction) => {
      const category = await categoryRepository.findByPk(id, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      })

      if (!category) {
        throw createAppError('CATEGORY_NOT_FOUND', { id })
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
        parentCategory = await categoryRepository.findByPk(parentId, { transaction })

        if (!parentCategory) {
          throw createAppError('CATEGORY_PARENT_NOT_FOUND', { parentId })
        }

        if (parentCategory.path.split('/').map(Number).includes(id)) {
          throw createAppError('CATEGORY_PARENT_LOOP', {
            categoryId: id,
            parentId,
          })
        }
      }

      const oldPath = category.path
      const newPath = parentCategory
        ? `${parentCategory.path}/${category.id}`
        : `${category.id}`

      await categoryRepository.updatePaths(oldPath, newPath, { transaction })

      const updatedCategory = await categoryRepository.updateByPk(
        category.id,
        {
          path: newPath,
          parentId,
        },
        { transaction },
      )

      useDatabaseAfterCommit(transaction, 'category.service.create_parent', async () => {
        await categorySource.invalidate([
          category,
          updatedCategory,
          parentCategory,
          ...children,
        ])
      })

      return updatedCategory
    })
  }

  /**
   * Deletes a category.
   *
   * @param id - The ID of the category to delete
   * @throws CATEGORY_NOT_FOUND
   * @throws CATEGORY_HAS_CHILDREN
   * @throws CATEGORY_HAS_LOTS
   */
  async delete(id: number) {
    return await useDatabaseTransaction(async (transaction) => {
      const category = await categoryRepository.findByPk(id, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      })

      if (!category) {
        throw createAppError('CATEGORY_NOT_FOUND', { id })
      }

      const children = await categoryRepository.findAllByParentId(category.id, { transaction })

      if (children.length > 0) {
        throw createAppError('CATEGORY_HAS_CHILDREN', { childrenCount: children.length })
      }

      const lotsCount = await categoryRepository.countLotsByPath(category.path, { transaction })

      if (lotsCount > 0) {
        throw createAppError('CATEGORY_HAS_LOTS', { lotsCount })
      }

      await categoryRepository.destroyByPk(category.id, { transaction })

      useDatabaseAfterCommit(transaction, 'category.service.delete', async () => {
        await categorySource.invalidate(category)
      })
    })
  }
}

export const categoryService = new CategoryService()
