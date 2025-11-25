import { createLotResource, lotService, lotSource } from '~~/server/domains/lots'
import { getLotRequest } from '../index.request'
import { receiveLotPolicy } from './index.post.policy'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await getLotRequest(event)

  const lot = await lotSource.getById(request.params.id)

  receiveLotPolicy(event, lot)

  const updatedLot = await lotService.receive(request.params.id)

  return createLotResource(updatedLot)
})
