import type { Category } from '~~/server/database/models/Category'
import { lotStatuses } from '~~/server/constants'
import { categoryRepository } from '~~/server/repositories/category.repository'
import { lotRepository } from '~~/server/repositories/lot.repository'
import { createLotRequest } from '~~/server/requests/lots/lots.post.request'
import { categoryResource } from '~~/server/resources/category.resource'
import { imageResource } from '~~/server/resources/image.resource'
import { createLotResource } from '~~/server/resources/lot.resource'
import { createUserResource } from '~~/server/resources/user.resource'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const user = getAuthenticatedUser(event)

  const request = await createLotRequest(event)

  let category: Category | null = null

  if (request.body.categoryId) {
    category = await categoryRepository.findById(request.body.categoryId)

    if (!category) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
        message: 'Категорія не знайдена',
      })
    }
  }

  const lot = await lotRepository.create({
    userId: user.id,
    title: request.body.title,
    description: request.body.description,
    initialAmount: request.body.initialAmount,
    initialDuration: request.body.initialDuration,
    statusName: lotStatuses.DRAFT,
  })

  setResponseStatus(event, 201)

  return {
    ...createLotResource(lot),
    user: createUserResource(user),
    image: lot.image ? imageResource.create(lot.image) : null,
    winner: null,
    category: category ? categoryResource.create(category) : null,
    betsCount: 0,
    bets: [],
  }
})
