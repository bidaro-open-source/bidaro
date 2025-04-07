import type {
  ConfirmPasswordRequest,
} from '~/server/requests/auth/reset-password/confirm.post'
import type {
  ResetPasswordRequest,
} from '~/server/requests/auth/reset-password/index.post'
import { fetch } from '@nuxt/test-utils/e2e'

export async function resetPasswordRequest(
  body: ResetPasswordRequest['body'],
) {
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

export async function confirmResetPasswordRequest(
  body: ConfirmPasswordRequest['body'],
) {
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
