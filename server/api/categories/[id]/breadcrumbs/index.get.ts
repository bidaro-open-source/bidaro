import { createCategoryBreadcrumbResource } from '~~/server/resources/category.resource'
import { categoryService } from '~~/server/services/category.service'
import { getCategoryRequest } from '../index.request'

export default defineEventHandler(async (event) => {
  const request = await getCategoryRequest(event)

  const category = await categoryService.findByIdOrFail(request.params.id)

  const ids = category.path.split('/')

  const breadcrumbs = await Promise.all(
    ids.map(id => categoryService.findByIdOrFail(Number(id))),
  )

  return breadcrumbs.map(createCategoryBreadcrumbResource)
})
