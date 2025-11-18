import type { LoginRequest } from '~~/server/api/auth/login/index.request'
import type { LogoutRequest } from '~~/server/api/auth/logout/index.request'
import type { RefreshRequest } from '~~/server/api/auth/refresh/index.request'
import type registerApi from '~~/server/api/auth/register/index.post'
import type { RegisterRequest } from '~~/server/api/auth/register/index.request'
import type { AccessToken } from '~~/server/utils/crypto-access-token'
import { fetch } from '../fetch'

export async function registerUser() {
  const user = db.UserFactory.new().make()

  const response = await registerRequest({
    email: user.email,
    username: user.username,
    password: db.UserFactory.password,
  })

  return response._data as ReturnType<typeof registerApi>
}

export async function destroyUser(uid: number) {
  return (await db.User.findByPk(uid))!.destroy()
}

export async function registerRequest(body: RegisterRequest['body']) {
  return await fetch('/api/auth/register', {
    method: 'POST',
    body,
  })
}

export async function loginRequest(body: LoginRequest['body']) {
  return await fetch('/api/auth/login', {
    method: 'POST',
    body,
  })
}

export async function logoutRequest(
  body: LogoutRequest['body'],
  options: { accessToken?: AccessToken } = {},
) {
  return await fetch('/api/auth/logout', {
    method: 'POST',
    accessToken: options.accessToken,
    body,
  })
}

export async function refreshRequest(
  body: RefreshRequest['body'],
  options: { useBody?: boolean, useCookie?: boolean },
) {
  return await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: {
      Cookie: options.useCookie ? `jwt=${body.refresh_token}` : '',
    },
    body: options.useBody
      ? { refresh_token: body.refresh_token }
      : null,
  })
}
