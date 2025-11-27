import { categoryResource, categorySource } from '~~/server/domains/categories'

export default defineEventHandler(async () => {
  const categories = await categorySource.getRoot()

  return categoryResource.collection(categories)
})
