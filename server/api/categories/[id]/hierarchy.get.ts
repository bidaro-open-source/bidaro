import { categoryRepository } from '~~/server/repositories/category.repository'
import { getCategoryRequest } from '~~/server/requests/category.request'
import { categoryResource } from '~~/server/resources/category.resource'

export default defineEventHandler(async (event) => {
  const request = await getCategoryRequest(event)

  const category = await categoryRepository.findParentTreeById(request.params.id)

  if (!category) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Категорія не знайдена',
    })
  }

  return categoryResource.createParentTree(category)
})
