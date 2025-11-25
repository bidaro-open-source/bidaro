import { categorySource, createCategoryBreadcrumbResource } from '~~/server/domains/categories'
import { viewCategoryRequest } from '../index.request'

export default defineEventHandler(async (event) => {
  const request = await viewCategoryRequest(event)

  const category = await categorySource.getById(request.params.id)
  const breadcrumbs = await categorySource.getBreadcrumbsByPath(category.path)

  return breadcrumbs.map(createCategoryBreadcrumbResource)
})
