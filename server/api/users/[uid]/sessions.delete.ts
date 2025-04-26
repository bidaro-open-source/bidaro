import { deleteSessionsPolicy } from '~/server/policies/users/sessions'
import { deleteSessionsRequest } from '~/server/requests/users/sessions'
import { deleteAuthenticationSessions } from '~/server/services/authentication'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await validateRequest(event, deleteSessionsRequest)

  mustBeAuthorized(event, deleteSessionsPolicy, request.params.uid)

  return await deleteAuthenticationSessions(
    request.params.uid,
    request.body.uuids,
  )
})
