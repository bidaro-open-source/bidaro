import { categoryResource, categorySource } from '#domains/categories'

export default defineEventHandler(async () => {
  const categories = await categorySource.getRoot()

  return categoryResource.collection(categories)
})
