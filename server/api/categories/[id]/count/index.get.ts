import { categoryRepository, categorySource } from '#domains/categories'
import { viewCategoryRequest } from '../index.request'
import { viewCategoryCountPolicy } from './index.get.policy'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await viewCategoryRequest(event)

  viewCategoryCountPolicy(event)

  const category = await categorySource.getById(request.params.id)
  const countLots = await categoryRepository.countLotsByPath(category.path)

  return countLots
})
