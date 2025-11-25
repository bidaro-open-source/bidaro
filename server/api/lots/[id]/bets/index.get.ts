import { createLotBetResource, lotSource } from '~~/server/domains/lots'
import { viewLotRequest } from '../index.request'

export default defineEventHandler(async (event) => {
  const request = await viewLotRequest(event)

  const lot = await lotSource.getById(request.params.id)

  const betsWithUser = await lotSource.getAllBetsById(lot.id)

  return betsWithUser.map(([bet, user]) => ({
    ...createLotBetResource(bet),
    user: {
      username: `${user.username.at(0)}******${user.username.at(-1)}`,
    },
  }))
})
