import { categoryRepository } from '~~/server/repositories/category.repository'
import { createCategoryResource } from '~~/server/resources/category.resource'
import { getCategoryRequest } from './index.get.request'

export default defineEventHandler(async (event) => {
  const request = await getCategoryRequest(event)

  const category = await categoryRepository.findByIdOrFail(request.params.id)
  const countLots = await categoryRepository.countLotsByPath(category.path)
  let childrenWithCounts: ReturnType<typeof createCategoryResource>[] = []

  if (category.children && category.children.length > 0) {
    childrenWithCounts = await Promise.all(
      category.children.map(async (child) => {
        const childCountLots = await categoryRepository.countLotsByPath(child.path)

        return {
          ...createCategoryResource(child),
          countLots: childCountLots,
        }
      }),
    )
  }

  return {
    ...createCategoryResource(category),
    children: childrenWithCounts,
    countLots,
  }
})
