import z from 'zod'
import { categoryRepository } from '~~/server/repositories/category.repository'
import { createCategoryResource } from '~~/server/resources/category.resource'
import { updateCateogryPolicy } from '../index.policy'
import { updateCategoryRequest } from './index.patch.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await updateCategoryRequest(event)

  updateCateogryPolicy(event)

  const category = await categoryRepository.findByIdOrFail(request.params.id)

  if (request.body.slug) {
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

    category.slug = request.body.slug
  }

  if (typeof request.body.parentId === 'object') {
    category.parentId = request.body.parentId
  }

  if (typeof request.body.parentId === 'number') {
    const categoryById = await categoryRepository.findById(request.body.parentId)

    if (!categoryById) {
      const issues: z.ZodIssue[] = [{
        code: 'custom',
        path: ['parentId'],
        message: 'Передана батьківська категорія не існує',
      }]

      throw createError({
        statusCode: 422,
        message: 'Неправильні дані запиту',
        data: new z.ZodError(issues).flatten(),
      })
    }

    category.parentId = request.body.parentId
  }

  category.displayName = request.body.displayName ?? category.displayName
  category.description = request.body.description ?? category.description

  const updatedCategory = await categoryRepository.save(category)

  return createCategoryResource(updatedCategory)
})
