import { categoryService } from '~~/server/services/category.service'
import { deleteCateogryPolicy } from '../index.policy'
import { deleteCategoryRequest } from './index.delete.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await deleteCategoryRequest(event)

  deleteCateogryPolicy(event)

  await categoryService.delete(request.params.id)
})
