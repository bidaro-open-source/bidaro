import { createCategoryResource } from '~~/server/resources/category.resource'
import { categoryService } from '~~/server/services/category'
import { createCategoryPolicy } from './index.policy'
import { createCategoryRequest } from './index.post.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await createCategoryRequest(event)

  createCategoryPolicy(event)

  const category = await categoryService.create(request.body)

  setResponseStatus(event, 201)

  return createCategoryResource(category)
})
