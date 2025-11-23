import type { Role } from '../database'
import { createPermissionResource } from './permission.resource'

export type RoleResource = ReturnType<typeof createRoleResource>

export function createRoleResource(entity: Role) {
  return {
    name: entity.name,
    displayName: entity.displayName,
    description: entity.description,
    permissions: entity.permissions?.map(createPermissionResource),
  }
}
