import type { UserAttributes } from '../../database'

export type UserResource = ReturnType<typeof createUserResource>

export function createUserResource(entity: UserAttributes) {
  return {
    id: entity.id as number,
    name: entity.name,
    surname: entity.surname,
    username: entity.username,
  }
}

export type ProfileResource = ReturnType<typeof createProfileResource>

export function createProfileResource(entity: UserAttributes) {
  return {
    id: entity.id as number,
    name: entity.name,
    surname: entity.surname,
    email: entity.email,
    emailVerifiedAt: entity.emailVerifiedAt as string | null,
    username: entity.username,
  }
}

export type UserAnonymousResource = ReturnType<typeof createUserAnonymousResource>

export function createUserAnonymousResource(entity: Pick<UserAttributes, 'username'>) {
  return {
    username: `${entity.username.at(0) || ''}******${entity.username.at(-1) || ''}`,
  }
}
