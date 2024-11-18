import { hashSync } from 'bcrypt'
import type {
  User,
  UserAttributes,
  UserAttributesOptional,
  UserModel,
} from '~/server/database'
import { Factory } from '../class/Factory'

type PartialAttributes = Partial<UserAttributes>
type CreationAttributes = UserAttributesOptional

export class UserFactory extends Factory<User> {
  public static readonly password: string = 'password'

  public static readonly newPassword: string = 'new-password'

  public static readonly invalidPassword: string = 'password_invalid'

  public static readonly invalidUsername: string = 'username_invalid'

  protected definition(attr: PartialAttributes = {}): CreationAttributes {
    const user = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)

    return {
      email: attr.email ?? `u${user}@example.com`,
      username: attr.username ?? `u${user}`,
      password: hashSync(attr.password ?? UserFactory.password, 10),
      roleId: attr.roleId ?? 1,
    }
  }
}

export function InitializeUserFactroy(model: UserModel): typeof UserFactory {
  UserFactory.init(model)
  return UserFactory
}
