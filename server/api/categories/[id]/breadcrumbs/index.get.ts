import { createCategoryBreadcrumbResource } from '~~/server/resources/category.resource'
import { categorySource } from '~~/server/sources/category.source'
import { getCategoryRequest } from '../index.request'

export default defineEventHandler(async (event) => {
  const request = await getCategoryRequest(event)

  const category = await categorySource.getById(request.params.id)
  const breadcrumbs = await categorySource.getBreadcrumbsByPath(category.path)

  return breadcrumbs.map(createCategoryBreadcrumbResource)
})
