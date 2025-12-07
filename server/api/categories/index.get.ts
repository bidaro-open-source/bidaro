import { categoryResource, categorySource } from '#domains/categories'

export default defineEventHandler(async (event) => {
  await useRateLimiter(event, {
    authenticatedLimit: 40,
    anonymousLimit: 300,
    duration: 60,
  })

  const categories = await categorySource.getRoot()

  return categoryResource.collection(categories)
})
