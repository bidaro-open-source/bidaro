import { createOnlyLotResource } from '~~/server/resources/lot.resource'
import { lotService } from '~~/server/services/lot.service'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const user = getAuthenticatedUser(event)

  const lot = await lotService.createDraft(user.id)

  setResponseStatus(event, 201)

  return createOnlyLotResource(lot)
})
