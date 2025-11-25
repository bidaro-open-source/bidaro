import type { PermissionAttributes } from '../../database'

export type PermissionResource = ReturnType<typeof createPermissionResource>

export function createPermissionResource(entity: PermissionAttributes) {
  return {
    name: entity.name,
    displayName: entity.displayName,
    description: entity.description,
  }
}
