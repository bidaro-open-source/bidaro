import { categoryResource, categoryService } from '#domains/categories'
import { updateCategoryParentPolicy } from './index.get.policy'
import { updateCategoryParentRequest } from './index.put.request'

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

  const request = await updateCategoryParentRequest(event)

  updateCategoryParentPolicy(event)

  const updatedCategory = await categoryService.updateParent(
    request.params.id,
    request.body.parentId,
  )

  return categoryResource.make(updatedCategory)
})
