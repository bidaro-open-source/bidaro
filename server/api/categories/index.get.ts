import { categoryRepository } from '~~/server/repositories/category.repository'

export default defineEventHandler(async () => {
  return await categoryRepository.findAllByParentId(null)
})
