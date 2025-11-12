// Удаляет категорию (только если у категории нет дочек) (нужны права)

import { categoryRepository } from '~~/server/repositories/category.repository'
import { deleteCateogryPolicy } from '../index.policy'
import { deleteCategoryRequest } from './index.delete.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await deleteCategoryRequest(event)

  deleteCateogryPolicy(event)

  const category = await categoryRepository.findByIdOrFail(request.params.id)

  if (!category.children || category.children?.length > 0) {
    throw createError({
      statusCode: 400,
      message: 'Не можна видалити категорію, яка має дочірні категорії',
    })
  }

  await categoryRepository.destory(category.id)
})
