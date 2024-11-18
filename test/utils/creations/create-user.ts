import { loginRequest } from '../requests/authentication'

export async function createUser(permissions: number | number[] = []) {
  const role = await db.RoleFactory.new().create()
  const user = await db.UserFactory.new().create({ roleId: role.id })

  await role.addPermissions(
    Array.isArray(permissions) ? permissions : [permissions],
  )

  const loginResponse = await loginRequest({
    username: user.username,
    password: db.UserFactory.password,
  })

  const loginData = await loginResponse.json()

  return {
    user,
    role,
    loginData,
  }
}
