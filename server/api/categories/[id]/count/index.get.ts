import { categoryRepository, categorySource } from '~~/server/modules/categories'
import { getCategoryRequest } from '../index.request'
import { getCategoryCountPolicy } from './index.get.policy'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await getCategoryRequest(event)

  getCategoryCountPolicy(event)

  const category = await categorySource.getById(request.params.id)
  const countLots = await categoryRepository.countLotsByPath(category.path)

  return countLots
})
