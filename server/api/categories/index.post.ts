import type { Category } from '~~/server/database'
import { v4 as uuidv4 } from 'uuid'
import z from 'zod'
import { categoryRepository } from '~~/server/repositories/category.repository'
import { createCategoryResource } from '~~/server/resources/category.resource'
import { createCateogryPolicy } from './index.policy'
import { createCategoryRequest } from './index.post.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await createCategoryRequest(event)

  createCateogryPolicy(event)

  const categoryBySlug = await categoryRepository.findBySlug(request.body.slug)

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

  let parentCategory: Category | null = null

  if (request.body.parentId) {
    parentCategory = await categoryRepository.findById(request.body.parentId)

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
  }

  const transaction = await useDatabaseTransaction(event)

  try {
    const category = await categoryRepository.create({
      ...request.body,
      parentId: undefined,
      path: uuidv4(),
    }, { transaction })

    category.parentId = parentCategory ? parentCategory.id : null
    category.path = parentCategory
      ? `${parentCategory.path}/${category.id}`
      : `${category.id}`

    await category.save({ transaction })

    setResponseStatus(event, 201)

    await transaction.commit()

    return createCategoryResource(category)
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
})
