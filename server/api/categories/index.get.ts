import { categoryRepository } from '~~/server/repositories/category.repository'
import { createCategoryResource } from '~~/server/resources/category.resource'

export default defineEventHandler(async () => {
  const categories = await categoryRepository.findAllByParentId(null)

  return Promise.all(
    categories.map(async (category) => {
      const countLots = await categoryRepository.countLotsByPath(category.path)
      return createCategoryResource(category, countLots)
    }),
  )
})
