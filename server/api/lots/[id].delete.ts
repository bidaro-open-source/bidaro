import { deleteLotRequest } from '~~/server/requests/lots/lot.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const user = getAuthenticatedUser(event)

  const request = await deleteLotRequest(event)

  const db = useDatabase()

  const lot = await db.Lot.findByPk(request.params.id)

  if (!lot) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Лот не знайдено',
    })
  }

  if (lot.userId !== user.id) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Вам не дозволено видаляти цей лот',
    })
  }

  if (lot.statusName !== 'draft') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Цей лот не може бути видалений, оскільки він вже опублікований',
    })
  }

  await lot.destroy()
})
