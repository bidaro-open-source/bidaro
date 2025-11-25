import { createCategoryResource } from '~~/server/resources/category.resource'
import { categorySource } from '~~/server/sources/category.source'

export default defineEventHandler(async () => {
  const categories = await categorySource.getRoot()

  return categories.map(createCategoryResource)
})
