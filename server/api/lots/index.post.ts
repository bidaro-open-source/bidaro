import { lotResource, lotService } from '#domains/auction'
import { createLotPolicy } from './index.policy'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  createLotPolicy(event)

  const user = getAuthenticatedUser(event)

  const lot = await lotService.createDraft(user.id)

  setResponseStatus(event, 201)

  return lotResource.make(lot)
})
