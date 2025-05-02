import type { User } from '../database'

export type ProfileResource = ReturnType<
  typeof createProfileResource
>

export function createProfileResource(entity: User) {
  const role = ensureIncludedModel(entity, 'role')
  const permissions = role ? ensureIncludedModel(role, 'permissions') : []

  return {
    id: ensureIncludedKey(entity, 'id') as number,
    email: ensureIncludedKey(entity, 'email'),
    username: ensureIncludedKey(entity, 'username'),
    role: role
      ? {
          name: ensureIncludedKey(role, 'name'),
          displayName: ensureIncludedKey(role, 'displayName'),
          description: ensureIncludedKey(role, 'description'),
        }
      : null,
    permissions: (permissions || []).map(perm => ({
      name: ensureIncludedKey(perm, 'name'),
      displayName: ensureIncludedKey(perm, 'displayName'),
      description: ensureIncludedKey(perm, 'description'),
    })),
  }
}
