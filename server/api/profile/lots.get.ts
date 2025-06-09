import { createLotResource } from '~~/server/resources/lot.resource'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const user = getAuthenticatedUser(event)

  const lots = await user.getLots()

  return lots.map(lot => createLotResource(lot))
})
