import z from 'zod'
import { categoryRepository } from '~~/server/repositories/category.repository'
import { createCategoryResource } from '~~/server/resources/category.resource'
import { createCateogryPolicy } from './index.policy'
import { createCategoryRequest } from './index.post.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await createCategoryRequest(event)

  createCateogryPolicy(event)

  const categoryBySlug = await categoryRepository.findBySlug(request.body.slug)

  if (categoryBySlug) {
    const issues: z.ZodIssue[] = [{
      code: 'custom',
      path: ['slug'],
      message: 'Слаг вже зайнят',
    }]

    throw createError({
      statusCode: 422,
      message: 'Неправильні дані запиту',
      data: new z.ZodError(issues).flatten(),
    })
  }

  try {
    const category = await categoryRepository.create(request.body)

    setResponseStatus(event, 201)

    return createCategoryResource(category)
  }
  catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Unprocessable Content',
      message: 'Невідома помилка під час створення категорії',
      data: error,
    })
  }
})
