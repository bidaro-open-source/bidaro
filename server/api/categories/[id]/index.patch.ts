import { categoryService, createCategoryResource } from '~~/server/domains/categories'
import { updateCategoryPolicy } from '../index.policy'
import { updateCategoryRequest } from './index.patch.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await updateCategoryRequest(event)

  updateCategoryPolicy(event)

  const updatedCategory = await categoryService.update(request.params.id, request.body)

  return createCategoryResource(updatedCategory)
})
