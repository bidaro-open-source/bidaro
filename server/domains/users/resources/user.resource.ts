import type { UserAttributes } from '../../../database'
import { BaseResource } from '~~/server/class/BaseResource'

export interface UserDto {
  id: number
  name: string | null
  surname: string | null
  username: string
}

class UserResource extends BaseResource<UserAttributes, UserDto> {
  protected transform(entity: UserAttributes): UserDto {
    return {
      id: entity.id,
      name: entity.name,
      surname: entity.surname,
      username: entity.username,
    }
  }
}

export const userResource = new UserResource()
