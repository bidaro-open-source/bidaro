import { categorySource, createCategoryResource } from '~~/server/modules/categories'

export default defineEventHandler(async () => {
  const categories = await categorySource.getRoot()

  return categories.map(createCategoryResource)
})
