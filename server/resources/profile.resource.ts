import type { User } from '../database'

export type ProfileResource = ReturnType<typeof createProfileResource>

export function createProfileResource(entity: User) {
  return {
    id: entity.id as number,
    name: entity.name,
    surname: entity.surname,
    email: entity.email,
    emailVerifiedAt:
      entity.emailVerifiedAt as string | null,
    username: entity.username,
  }
}
