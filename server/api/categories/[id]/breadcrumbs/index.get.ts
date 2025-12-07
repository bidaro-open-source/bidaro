import { categoryBreadcrumbResource, categorySource } from '#domains/categories'
import { viewCategoryRequest } from '../index.request'

/**
 * API endpoint handler
 */
export default defineEventHandler(async (event) => {
  await useRateLimiter(event, {
    authenticatedLimit: 40,
    anonymousLimit: 300,
    duration: 60,
  })

  const request = await viewCategoryRequest(event)

  const category = await categorySource.getById(request.params.id)
  const breadcrumbs = await categorySource.getBreadcrumbsByPath(category.path)

  return categoryBreadcrumbResource.collection(breadcrumbs)
})
