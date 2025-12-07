import { categoryResource, categorySource } from '#domains/categories'
import { viewCategoryRequest } from './index.request'

export default defineEventHandler(async (event) => {
  await useRateLimiter(event, {
    authenticatedLimit: 40,
    anonymousLimit: 300,
    duration: 60,
  })

  const request = await viewCategoryRequest(event)

  const category = await categorySource.getById(request.params.id)
  const children = await categorySource.getChildrenById(category.id)

  return {
    ...categoryResource.make(category),
    children: categoryResource.collection(children),
  }
})
