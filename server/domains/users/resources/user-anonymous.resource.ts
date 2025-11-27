import type { UserAttributes } from '~~/server/database'
import { BaseResource } from '~~/server/class/BaseResource'

export interface UserAnonymousDto {
  username: string
}

type UserAnonymousAttributes = Pick<UserAttributes, 'username'>

class UserAnonymousResource extends BaseResource<UserAnonymousAttributes, UserAnonymousDto> {
  protected transform(entity: UserAnonymousAttributes): UserAnonymousDto {
    return {
      username: `${entity.username.at(0) || ''}******${entity.username.at(-1) || ''}`,
    }
  }
}

export const userAnonymousResource = new UserAnonymousResource()
