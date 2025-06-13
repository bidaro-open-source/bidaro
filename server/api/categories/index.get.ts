import { categoryRepository } from '~~/server/repositories/category.repository'
import { categoryResource } from '~~/server/resources/category.resource'

export default defineEventHandler(async () => {
  const categories = await categoryRepository.findTreeByParentId(null)

  return categories.map(categoryResource.createTree)
})
