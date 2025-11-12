import { categoryRepository } from '~~/server/repositories/category.repository'
import { createCategoryResource } from '~~/server/resources/category.resource'
import { getCategoryRequest } from './index.get.request'

export default defineEventHandler(async (event) => {
  const request = await getCategoryRequest(event)

  const category = await categoryRepository.findByIdOrFail(request.params.id)

  return createCategoryResource(category)
})
