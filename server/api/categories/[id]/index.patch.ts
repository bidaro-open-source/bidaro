import { createCategoryResource } from '~~/server/resources/category.resource'
import { categoryService } from '~~/server/services/category'
import { updateCategoryPolicy } from '../index.policy'
import { updateCategoryRequest } from './index.patch.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await updateCategoryRequest(event)

  updateCategoryPolicy(event)

  const updatedCategory = await categoryService.update(request.params.id, request.body)

  // eslint-disable-next-line unused-imports/no-unused-vars
  const { children, countLots, ...other } = createCategoryResource(updatedCategory)

  return other
})
