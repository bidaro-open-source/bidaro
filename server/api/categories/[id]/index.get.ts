import type { CategoryResource } from '~~/server/resources/category.resource'
import { categoryRepository } from '~~/server/repositories/category.repository'
import { createCategoryResource } from '~~/server/resources/category.resource'
import { getCategoryRequest } from './index.get.request'

export default defineEventHandler(async (event) => {
  const request = await getCategoryRequest(event)

  const category = await categoryRepository.findByIdOrFail(request.params.id)
  const countLots = await categoryRepository.countLotsByPath(category.path)
  let childrenWithCounts: CategoryResource[] = []

  if (category.children && category.children.length > 0) {
    childrenWithCounts = await Promise.all(
      category.children.map(async (child) => {
        const childCountLots = await categoryRepository.countLotsByPath(child.path)
        return createCategoryResource(child, childCountLots)
      }),
    )

    return {
      id: category.id,
      parentId: category.parentId,
      slug: category.slug,
      displayName: category.displayName,
      description: category.description,
      children: childrenWithCounts,
      countLots,
    }
  }

  return {
    ...createCategoryResource(category, countLots),
    children: childrenWithCounts,
  }
})
