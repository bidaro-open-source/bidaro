import type { Role, User, UserCreationAttributes } from '~~/server/database'
import { loginRequest } from '../requests/authentication'

interface CreateUserOptions {
  withRole?: boolean
  withSession?: boolean
  withPermissions?: string[]
}

interface BaseResult {
  user: User
  role?: Role
  refresh_token?: string
  session_uuid?: string
  access_token?: string
  clear: () => Promise<void>
}

type CreateUserResult<T extends CreateUserOptions> = BaseResult & {
  role: T['withRole'] extends true
    ? Role
    : T['withPermissions'] extends number[]
      ? Role
      : undefined
  refresh_token: T['withSession'] extends true ? string : undefined
  session_uuid: T['withSession'] extends true ? string : undefined
  access_token: T['withSession'] extends true ? string : undefined
}

/**
 * Creates user in database.
 *
 * Can creates the role with permissions and attach it to the user.
 *
 * Can make login request for getting a session.
 *
 * @param options user options
 * @returns user, role, session and clear function
 */
export async function createUser<T extends CreateUserOptions>(
  options: T = {} as T,
): Promise<CreateUserResult<T>> {
  const attributes: Partial<UserCreationAttributes> = {}
  let role: Role | undefined
  let refresh_token: string | undefined
  let session_uuid: string | undefined
  let access_token: string | undefined

  if (options.withRole || options.withPermissions) {
    role = await db.RoleFactory.new().create()
    attributes.roleName = role.name
  }

  if (options.withPermissions && role) {
    await role.addPermissions(options.withPermissions)
  }

  const user = await db.UserFactory.new().create(attributes)

  if (options.withSession) {
    const response = await loginRequest({
      username: user.username,
      password: db.UserFactory.password,
    })

    const data = await response.json()

    refresh_token = data.refresh_token
    session_uuid = data.session_uuid
    access_token = data.access_token
  }

  const clear = async () => {
    await user.destroy()
    if (role)
      await role.destroy()
  }

  return {
    user,
    role,
    refresh_token,
    session_uuid,
    access_token,
    clear,
  } as CreateUserResult<T>
}
