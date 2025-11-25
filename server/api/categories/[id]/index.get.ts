import { categorySource, createCategoryResource } from '~~/server/modules/categories'
import { getCategoryRequest } from './index.request'

export default defineEventHandler(async (event) => {
  const request = await getCategoryRequest(event)

  const category = await categorySource.getById(request.params.id)
  const children = await categorySource.getChildrenById(category.id)

  return {
    ...createCategoryResource(category),
    children: children.map(createCategoryResource),
  }
})
