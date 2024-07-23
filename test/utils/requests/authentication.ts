import { fetch } from '@nuxt/test-utils/e2e'
import type { AccessToken } from '~/server/utils/crypto-access-token'
import type registerApi from '~/server/api/auth/register.post'
import type {
  RequestBody as LoginRequestBody,
} from '~/server/requests/auth/login.post'
import type {
  RequestBody as RegisterRequestBody,
} from '~/server/requests/auth/register.post'
import type {
  RequestBody as LogoutRequestBody,
} from '~/server/requests/auth/logout.post'
import type {
  RequestBody as RefreshRequestBody,
} from '~/server/requests/auth/refresh.post'

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

export async function registerRequest(body: RegisterRequestBody) {
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

export async function loginRequest(body: LoginRequestBody) {
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
  body: LogoutRequestBody,
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
  body: RefreshRequestBody,
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
