import { env } from 'node:process'
import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { fetch } from '~~/test/api-e2e/fetch'

async function diagnosticRequest() {
  return await fetch(`/api/diagnostic`, {
    method: 'GET',
    headers: {
      'x-diagnostic-token': env.NUXT_DIAGNOSTIC_TOKEN || '',
    },
  })
}

describe('GET /api/diagnostic', async () => {
  await setup({ host: env.SETUP_HOST })

  it('should return ok', async () => {
    const response = await diagnosticRequest()

    const data = response._data

    expect(data.ok).toBe(true)
  })
})
