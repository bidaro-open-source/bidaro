import type {
  ConfirmPasswordRequest,
} from '~~/server/requests/profile/recovery/confirm.request'
import type {
  ResetPasswordRequest,
} from '~~/server/requests/profile/recovery/index.request'
import { fetch } from '@nuxt/test-utils/e2e'

export async function resetPasswordRequest(
  body: ResetPasswordRequest['body'],
) {
  return await fetch('/api/profile/recovery', {
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
  return await fetch('/api/profile/recovery/confirm', {
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
