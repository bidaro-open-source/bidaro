import { permissionRepository } from '~~/server/repositories/permission.repository'
import { updatePermissionPolicy } from './index.patch.policy'
import { updatePermissionRequest } from './index.patch.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  updatePermissionPolicy(event)

  const request = await updatePermissionRequest(event)

  const permission = await permissionRepository.findByName(request.params.name)

  if (!permission) {
    throw createError({
      statusCode: 404,
      message: 'Право не знайдено',
    })
  }

  const updatedPermission = await permissionRepository.updateById(
    request.params.name,
    {
      displayName: permission.displayName ?? request.body.displayName,
      description: permission.description ?? request.body.description,
    },
  )

  return {
    name: updatedPermission.name,
    displayName: updatedPermission.displayName,
    description: updatedPermission.description,
  }
})
