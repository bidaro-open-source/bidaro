import type { Permission } from '../../database'

export type PermissionResource = ReturnType<typeof createPermissionResource>

export function createPermissionResource(entity: Permission) {
  return {
    name: entity.name,
    displayName: entity.displayName,
    description: entity.description,
  }
}
