import type { Category, CategoryAttributesOptional } from '../database'
import { v4 as uuidv4 } from 'uuid'
import z from 'zod'
import { categoryRepository } from '../repositories/category.repository'

export const categoryService = {
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

    return categoryBySlug
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

    return parentCategory
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
    const parentCategory = await categoryRepository.findByIdOrFail(parentId)

    if (parentCategory.path.split('/').map(Number).includes(id)) {
      const issues: z.ZodIssue[] = [{
        code: 'custom',
        path: ['parentId'],
        message: 'Батьківська категорія не може бути нащадком самої себе',
      }]

      throw createError({
        statusCode: 422,
        message: 'Неправильні дані запиту',
        data: new z.ZodError(issues).flatten(),
      })
    }

    return parentCategory
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

      await category.save({ transaction })

      await transaction.commit()

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
   * @throws 422 if the slug is already taken or parent category does not exist
   */
  async update(id: number, data: Partial<Omit<CategoryAttributesOptional, 'path'>>) {
    const transaction = await useDatabaseTransaction()

    try {
      const category = await categoryRepository.findByIdOrFail(id, { transaction })

      category.displayName = data.displayName ?? category.displayName
      category.description = data.description ?? category.description

      if (data.slug && data.slug !== category.slug) {
        await categoryService.checkSlugUnique(data.slug)
        category.slug = data.slug
      }

      const parentIsPassed = typeof data.parentId === 'number' || typeof data.parentId === 'object'
      const parentIsSame = data.parentId === category.parentId
      const parentIsId = typeof data.parentId === 'number'

      if (parentIsPassed && !parentIsSame) {
        let parentCategory: Category | null = null

        if (parentIsId) {
          parentCategory = await categoryService.checkParentExists(data.parentId as number)
          await categoryService.checkParentIsNotChildren(category.id, data.parentId as number)
        }

        const oldPath = category.path
        const newPath = parentCategory
          ? `${parentCategory.path}/${category.id}`
          : `${category.id}`

        category.path = newPath
        category.parentId = parentIsId ? data.parentId as number : null

        await categoryRepository.updatePaths(oldPath, newPath, { transaction })
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
   * Deletes a category.
   *
   * @param id - The ID of the category to delete
   * @throws 400 if the category has children or lots
   * @throws 404 if the category does not exist
   */
  async delete(id: number) {
    const category = await categoryRepository.findByIdOrFail(id)

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

    await categoryRepository.destory(category.id)
  },
}
