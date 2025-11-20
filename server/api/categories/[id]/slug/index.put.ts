import { createCategoryResource } from '~~/server/resources/category.resource'
import { categoryService } from '~~/server/services/category.service'
import { updateCategorySlugPolicy } from './index.get.policy'
import { updateCategorySlugRequest } from './index.put.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await updateCategorySlugRequest(event)

  updateCategorySlugPolicy(event)

  const updatedCategory = await categoryService.updateSlug(
    request.params.id,
    request.body.slug,
  )

  return createCategoryResource(updatedCategory)
})
