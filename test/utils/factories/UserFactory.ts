import { hashSync } from 'bcrypt'
import { Factory } from './Factory'
import type {
  User,
  UserAttributesOptional,
  UserModel,
} from '~/server/models'

export class UserFactory extends Factory<User> {
  public static readonly password: string = 'password'

  public static readonly newPassword: string = 'new-password'

  public static readonly invalidPassword: string = 'password_invalid'

  public static readonly invalidUsername: string = 'username_invalid'

  protected definition(): UserAttributesOptional {
    const user = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)

    return {
      email: `u${user}@example.com`,
      username: `u${user}`,
      password: hashSync(UserFactory.password, 10),
    }
  }
}

export function InitializeUserFactroy(model: UserModel): typeof UserFactory {
  UserFactory.init(model)
  return UserFactory
}
