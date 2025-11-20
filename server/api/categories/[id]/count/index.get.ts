import { categoryRepository } from '~~/server/repositories/category.repository'
import { categoryService } from '~~/server/services/category.service'
import { getCategoryRequest } from '../index.request'
import { getCategoryCountPolicy } from './index.get.policy'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await getCategoryRequest(event)

  getCategoryCountPolicy(event)

  const category = await categoryService.findByIdOrFail(request.params.id)
  const countLots = await categoryRepository.countLotsByPath(category.path)

  return countLots
})
