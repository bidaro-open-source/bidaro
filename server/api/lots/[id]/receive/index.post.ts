import { createLotResource, lotService, lotSource } from '~~/server/domains/auction'
import { viewLotRequest } from '../index.request'
import { receiveLotPolicy } from './index.post.policy'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await viewLotRequest(event)

  const lot = await lotSource.getById(request.params.id)

  receiveLotPolicy(event, lot)

  const updatedLot = await lotService.receive(request.params.id)

  return createLotResource(updatedLot)
})
