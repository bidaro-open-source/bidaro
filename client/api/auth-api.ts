import type { LoginRequest } from '~~/server/requests/auth/login.post'
import type { RegisterRequest } from '~~/server/requests/auth/register.post'

export function createAuthApi(fetch: typeof $fetch) {
  return {
    async register(payload: RegisterRequest) {
      return fetch('/api/auth/register', { method: 'POST', body: payload.body })
    },
    async login(payload: LoginRequest) {
      return fetch('/api/auth/login', { method: 'POST', body: payload.body })
    },
    async refresh() {
      return fetch('/api/auth/refresh', { method: 'POST' })
    },
    async logout() {
      return fetch('/api/auth/logout', { method: 'POST' })
    },
  }
}
