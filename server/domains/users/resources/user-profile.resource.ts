import type { UserAttributes } from '#database'
import { BaseResource } from '#class/BaseResource'

export interface UserProfileDto {
  id: number
  name: string | null
  surname: string | null
  username: string
  email: string
  emailVerifiedAt: string | null
}

class UserProfileResource extends BaseResource<UserAttributes, UserProfileDto> {
  protected transform(entity: UserAttributes): UserProfileDto {
    return {
      id: entity.id,
      name: entity.name,
      surname: entity.surname,
      email: entity.email,
      emailVerifiedAt: entity.emailVerifiedAt as string | null,
      username: entity.username,
    }
  }
}

export const userProfileResource = new UserProfileResource()
