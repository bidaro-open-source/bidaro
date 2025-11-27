import { categoryResource, categoryService } from '#domains/categories'
import { updateCategoryParentPolicy } from './index.get.policy'
import { updateCategoryParentRequest } from './index.put.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await updateCategoryParentRequest(event)

  updateCategoryParentPolicy(event)

  const updatedCategory = await categoryService.updateParent(
    request.params.id,
    request.body.parentId,
  )

  return categoryResource.make(updatedCategory)
})
