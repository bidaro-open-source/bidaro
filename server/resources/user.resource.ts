import type { User } from '../database'

export type UserResource = ReturnType<typeof createUserResource>

export function createUserResource(entity: User) {
  return {
    id: ensureIncludedKey(entity, 'id') as number,
    name: ensureIncludedKey(entity, 'name'),
    surname: ensureIncludedKey(entity, 'surname'),
    username: ensureIncludedKey(entity, 'username'),
  }
}
