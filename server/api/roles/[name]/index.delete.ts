import { roleService } from '~~/server/domains/authorization'
import { deleteRolePolicy } from './index.policy'
import { viewRoleRequest } from './index.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await viewRoleRequest(event)

  deleteRolePolicy(event)

  await roleService.delete(request.params.name)

  setResponseStatus(event, 204)
})
