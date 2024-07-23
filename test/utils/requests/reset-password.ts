import { fetch } from '@nuxt/test-utils/e2e'
import type {
  RequestBody,
} from '~/server/requests/auth/reset-password/index.post'
import type {
  RequestBody as ConfirmRequestBody,
} from '~/server/requests/auth/reset-password/confirm.post'

export async function resetPasswordRequest(body: RequestBody) {
  return await fetch('/api/auth/reset-password', {
    body: JSON.stringify({
      email: body.email,
    }),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export async function confirmResetPasswordRequest(body: ConfirmRequestBody) {
  return await fetch('/api/auth/reset-password/confirm', {
    body: JSON.stringify({
      token: body.token,
      password: body.password,
    }),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
