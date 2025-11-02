import type { User } from '../database'

export type UserResource = ReturnType<typeof createUserResource>

export function createUserResource(entity: User) {
  return {
    id: entity.id as number,
    name: entity.name,
    surname: entity.surname,
    username: entity.username,
  }
}
