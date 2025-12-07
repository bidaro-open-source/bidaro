import { categoryResource, categoryService } from '#domains/categories'
import { updateCategoryPolicy } from '../index.policy'
import { updateCategoryRequest } from './index.patch.request'

/**
 * API endpoint handler
 */
export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  await useRateLimiter(event, {
    authenticatedLimit: 20,
    anonymousLimit: 0,
    duration: 60,
  })

  const request = await updateCategoryRequest(event)

  updateCategoryPolicy(event)

  const updatedCategory = await categoryService.update(request.params.id, request.body)

  return categoryResource.make(updatedCategory)
})
