import type registerApi from '~~/server/api/auth/register.post'
import type { LoginRequest } from '~~/server/requests/auth/login.post'
import type { LogoutRequest } from '~~/server/requests/auth/logout.post'
import type { RefreshRequest } from '~~/server/requests/auth/refresh.post'
import type { RegisterRequest } from '~~/server/requests/auth/register.post'
import type { AccessToken } from '~~/server/utils/crypto-access-token'
import { fetch } from '@nuxt/test-utils/e2e'

export async function registerUser() {
  const user = db.UserFactory.new().make()

  const response = await registerRequest({
    email: user.email,
    username: user.username,
    password: db.UserFactory.password,
  })

  return await response.json() as ReturnType<typeof registerApi>
}

export async function destroyUser(uid: number) {
  return (await db.User.findByPk(uid))!.destroy()
}

export async function registerRequest(body: RegisterRequest['body']) {
  return await fetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email: body.email,
      username: body.username,
      password: body.password,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export async function loginRequest(body: LoginRequest['body']) {
  return await fetch('/api/auth/login', {
    body: JSON.stringify({
      username: body.username,
      password: body.password,
    }),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export async function logoutRequest(
  body: LogoutRequest['body'],
  options: { accessToken: AccessToken },
) {
  return await fetch('/api/auth/logout', {
    body: JSON.stringify({
      refresh_token: body.refresh_token,
    }),
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${options.accessToken}`,
      'Content-Type': 'application/json',
    },
  })
}

export async function refreshRequest(
  body: RefreshRequest['body'],
  options: { useBody?: boolean, useCookie?: boolean },
) {
  return await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': options.useCookie ? `jwt=${body.refresh_token}` : '',
    },
    body: options.useBody
      ? JSON.stringify({ refresh_token: body.refresh_token })
      : null,
  })
}
