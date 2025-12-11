import { env } from 'node:process'
import { describe, expect, it } from 'vitest'
import { fetch } from '~~/test/api-e2e/fetch'
import { expectApiError } from '../utils/expect-api-error'

async function diagnosticRequest(headers = {}) {
  return await fetch(`/api/diagnostic`, {
    method: 'GET',
    headers,
  })
}

describe('GET /api/diagnostic', async () => {
  it('should return ok', async () => {
    const response = await diagnosticRequest({
      'x-diagnostic-token': env.DIAGNOSTIC_TOKEN || '',
    })

    const data = response._data

    expect(response.status).toBe(200)
    expect(data.ok).toBe(true)
  })

  it('should return 401 when token not exist', async () => {
    const response = await diagnosticRequest()

    expectApiError(response, 'UNAUTHORIZED')
  })

  it('should return 401 when token invalid', async () => {
    const response = await diagnosticRequest({
      'x-diagnostic-token': 'invalid-token',
    })

    expectApiError(response, 'UNAUTHORIZED')
  })
})
