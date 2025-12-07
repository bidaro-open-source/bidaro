import { categoryResource, categoryService } from '#domains/categories'
import { updateCategorySlugPolicy } from './index.get.policy'
import { updateCategorySlugRequest } from './index.put.request'

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

  const request = await updateCategorySlugRequest(event)

  updateCategorySlugPolicy(event)

  const updatedCategory = await categoryService.updateSlug(
    request.params.id,
    request.body.slug,
  )

  return categoryResource.make(updatedCategory)
})
