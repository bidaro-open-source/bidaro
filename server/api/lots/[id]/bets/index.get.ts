import { lotBetResource, lotSource } from '#domains/auction'
import { userAnonymousResource } from '#domains/users'
import { viewLotRequest } from '../index.request'

export default defineEventHandler(async (event) => {
  const request = await viewLotRequest(event)

  const lot = await lotSource.getById(request.params.id)

  const betsWithUser = await lotSource.getAllBetsById(lot.id)

  return betsWithUser.map(bet => ({
    ...lotBetResource.make(bet),
    user: userAnonymousResource.make(bet.user),
  }))
})
