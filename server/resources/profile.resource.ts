import type { User } from '../database'

export type ProfileResource = ReturnType<
  typeof createProfileResource
>

export function createProfileResource(entity: User) {
  const role = entity.role
  const permissions = role?.permissions || []

  return {
    id: entity.id as number,
    name: entity.name,
    surname: entity.surname,
    email: entity.email,
    emailVerifiedAt:
      entity.emailVerifiedAt as string | null,
    username: entity.username,
    role: role
      ? {
          name: entity.name,
          displayName: role.displayName,
          description: role.description,
        }
      : null,
    permissions: permissions.map(perm => ({
      name: perm.name,
      displayName: perm.displayName,
      description: perm.description,
    })),
  }
}
