import { createLotBetResource, lotSource } from '~~/server/domains/auction'
import { createUserAnonymousResource } from '~~/server/domains/users'
import { viewLotRequest } from '../index.request'

export default defineEventHandler(async (event) => {
  const request = await viewLotRequest(event)

  const lot = await lotSource.getById(request.params.id)

  const betsWithUser = await lotSource.getAllBetsById(lot.id)

  return betsWithUser.map(bet => ({
    ...createLotBetResource(bet),
    user: createUserAnonymousResource(bet.user),
  }))
})
