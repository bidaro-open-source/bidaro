import { categoryService } from '#domains/categories'
import { deleteCateogryPolicy } from '../index.policy'
import { viewCategoryRequest } from './index.request'

/**
 * API endpoint handler
 */
export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  await useRateLimiter(event, {
    authenticatedLimit: 10,
    anonymousLimit: 0,
    duration: 60,
  })

  const request = await viewCategoryRequest(event)

  deleteCateogryPolicy(event)

  await categoryService.delete(request.params.id)
})
