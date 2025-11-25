import { categoryService } from '~~/server/domains/categories'
import { deleteCateogryPolicy } from '../index.policy'
import { viewCategoryRequest } from './index.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await viewCategoryRequest(event)

  deleteCateogryPolicy(event)

  await categoryService.delete(request.params.id)
})
