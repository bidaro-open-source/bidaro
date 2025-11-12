import { categoryRepository } from '~~/server/repositories/category.repository'
import { createCategoryResource } from '~~/server/resources/category.resource'

export default defineEventHandler(async () => {
  const categories = await categoryRepository.findAllByParentId(null)

  return categories.map(createCategoryResource)
})
