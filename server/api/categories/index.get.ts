import { createCategoryResource } from '~~/server/resources/category.resource'
import { categoryService } from '~~/server/services/category.service'

export default defineEventHandler(async () => {
  const categories = await categoryService.getRootCategories()

  return categories.map(createCategoryResource)
})
