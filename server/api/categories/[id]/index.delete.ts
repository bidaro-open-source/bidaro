import { categoryService } from '~~/server/services/category.service'
import { deleteCateogryPolicy } from '../index.policy'
import { getCategoryRequest } from './index.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await getCategoryRequest(event)

  deleteCateogryPolicy(event)

  await categoryService.delete(request.params.id)
})
