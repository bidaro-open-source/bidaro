import { categoryResource, categorySource } from '~~/server/domains/categories'
import { viewCategoryRequest } from './index.request'

export default defineEventHandler(async (event) => {
  const request = await viewCategoryRequest(event)

  const category = await categorySource.getById(request.params.id)
  const children = await categorySource.getChildrenById(category.id)

  return {
    ...categoryResource.make(category),
    children: categoryResource.collection(children),
  }
})
