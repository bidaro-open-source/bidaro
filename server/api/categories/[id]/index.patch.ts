import type { Category } from '~~/server/database'
import z from 'zod'
import { categoryRepository } from '~~/server/repositories/category.repository'
import { createCategoryResource } from '~~/server/resources/category.resource'
import { updateCateogryPolicy } from '../index.policy'
import { updateCategoryRequest } from './index.patch.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await updateCategoryRequest(event)

  updateCateogryPolicy(event)

  const transaction = await useDatabaseTransaction(event)

  try {
    const category = await categoryRepository.findByIdOrFail(request.params.id, { transaction })

    category.displayName = request.body.displayName ?? category.displayName
    category.description = request.body.description ?? category.description

    if (request.body.slug && request.body.slug !== category.slug) {
      const categoryBySlug = await categoryRepository.findBySlug(request.body.slug, { transaction })

      if (categoryBySlug) {
        throw new z.ZodError([{
          code: 'custom',
          path: ['slug'],
          message: 'Слаг вже зайнят',
        }])
      }

      category.slug = request.body.slug
    }

    const parentIsPassed = typeof request.body.parentId === 'number' || typeof request.body.parentId === 'object'
    const parentIsSame = request.body.parentId === category.parentId
    const parentIsId = typeof request.body.parentId === 'number'

    if (parentIsPassed && !parentIsSame) {
      let parentCategory: Category | null = null

      if (parentIsId) {
        parentCategory = await categoryRepository.findById(
          request.body.parentId as number,
          { transaction },
        )

        if (!parentCategory) {
          throw new z.ZodError([{
            code: 'custom',
            path: ['parentId'],
            message: 'Передана батьківська категорія не існує',
          }])
        }
      }

      const oldPath = category.path
      const newPath = parentCategory
        ? `${parentCategory.path}/${category.id}`
        : `${category.id}`

      category.path = newPath
      category.parentId = parentIsId ? request.body.parentId as number : null
      await categoryRepository.updatePaths(oldPath, newPath)
    }

    const updatedCategory = await categoryRepository.save(category, { transaction })

    await transaction.commit()

    // uncorrect child categories
    return createCategoryResource(updatedCategory)
  }
  catch (error) {
    await transaction.rollback()

    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 422,
        message: 'Неправильні дані запиту',
        data: error.flatten(),
      })
    }

    throw error
  }
})
