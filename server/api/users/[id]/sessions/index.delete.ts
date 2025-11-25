import { authService } from '~~/server/domains/authentication'
import { deleteSessionsRequest } from './index.delete.request'
import { deleteSessionsPolicy } from './index.policy'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await deleteSessionsRequest(event)

  deleteSessionsPolicy(event, request.params.id)

  const sessions = await authService.deleteSessions(
    request.params.id,
    request.body.uuids,
  )

  return sessions
})
