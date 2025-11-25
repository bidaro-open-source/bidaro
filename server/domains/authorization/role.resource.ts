import type { RoleAttributes } from '../../database'

export type RoleResource = ReturnType<typeof createRoleResource>

export function createRoleResource(entity: RoleAttributes) {
  return {
    name: entity.name,
    displayName: entity.displayName,
    description: entity.description,
  }
}
