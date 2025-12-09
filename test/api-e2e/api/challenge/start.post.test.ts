import { env } from 'node:process'
import { describe, expect, it } from 'vitest'
import { fetch } from '~~/test/api-e2e/fetch'
import { expectApiError } from '../../utils/expect-api-error'

const CAPTCHA_ENABLED = env.NUXT_CHALLENGE_ENABLED === 'true'

async function startChallengeRequest() {
  return await fetch('/api/challenge/start', { method: 'POST' })
}

describe.runIf(CAPTCHA_ENABLED)('POST /api/challenge/start', async () => {
  it('should create a challenge successfully', async () => {
    const response = await startChallengeRequest()

    expect(response.status).toBe(200)
    expect(response._data).toBeDefined()
    expect(response._data.challengeId).toBeDefined()
    expect(response._data.width).toBeDefined()
    expect(response._data.height).toBeDefined()
    expect(response._data.background).toBeDefined()
    expect(response._data.piece).toBeDefined()
    expect(response._data.pieceWidth).toBeDefined()
    expect(response._data.pieceHeight).toBeDefined()
  })
})

describe.skipIf(CAPTCHA_ENABLED)('POST /api/challenge/start (disabled)', async () => {
  it('should return 403 when challenge is disabled', async () => {
    const response = await startChallengeRequest()
    expectApiError(response, 'FEATURE_DISABLED')
  })
})
