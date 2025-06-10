import { deleteLotRequest } from '~~/server/requests/lots/lot.request'
import { getUserLot } from '~~/server/services/lot-service'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const user = getAuthenticatedUser(event)

  const request = await deleteLotRequest(event)

  const lot = await getUserLot(request.params.id, user.id)

  if (lot.statusName !== 'draft') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Цей лот не може бути видалений, оскільки він вже опублікований',
    })
  }

  await lot.destroy()
})
