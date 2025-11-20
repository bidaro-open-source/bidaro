import { createCategoryResource } from '~~/server/resources/category.resource'
import { categoryService } from '~~/server/services/category.service'
import { getCategoryRequest } from './index.request'

export default defineEventHandler(async (event) => {
  const request = await getCategoryRequest(event)

  const category = await categoryService.getById(request.params.id)
  const children = await categoryService.getChildrenById(category.id)

  return {
    ...createCategoryResource(category),
    children: children.map(createCategoryResource),
  }
})
