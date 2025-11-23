import { roleService } from '~~/server/services/role.service'
import { deleteRolePolicy } from './index.policy'
import { getRoleRequest } from './index.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await getRoleRequest(event)

  deleteRolePolicy(event)

  await roleService.delete(request.params.name)

  setResponseStatus(event, 204)
})
