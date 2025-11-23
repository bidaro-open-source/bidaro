import type { Permission, Role } from '../database'

export type RoleResource = ReturnType<typeof createRoleResource>

export function createRoleResource(entity: Role) {
  return {
    name: entity.name,
    displayName: entity.displayName,
    description: entity.description,
    permissions: entity.permissions?.map(createPermissionResource),
  }
}

export type PermissionResource = ReturnType<typeof createPermissionResource>

export function createPermissionResource(entity: Permission) {
  return {
    name: entity.name,
    displayName: entity.displayName,
    description: entity.description,
  }
}
