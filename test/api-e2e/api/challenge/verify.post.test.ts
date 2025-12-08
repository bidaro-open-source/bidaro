import type { VerifyChallengeRequest } from '../../../../server/api/challenge/verify.request'
import { env } from 'node:process'
import { describe, expect, it } from 'vitest'
import { getChallengeDeviation } from '~~/test/api-e2e/arrangers/challenge/get-challenge-deviation'
import { getChallengeInvalidDeviation } from '~~/test/api-e2e/arrangers/challenge/get-challenge-invalid-deviation'
import { getChallengeSolution } from '~~/test/api-e2e/arrangers/challenge/get-challenge-solution'
import { fetch } from '~~/test/api-e2e/fetch'

const CAPTCHA_ENABLED = env.NUXT_CHALLENGE_ENABLED === 'true'

async function startChallengeRequest() {
  return await fetch('/api/challenge/start', { method: 'POST' })
}

async function verifyChallengeRequest(payload: VerifyChallengeRequest) {
  return await fetch('/api/challenge/verify', {
    body: payload.body,
    method: 'POST',
  })
}

describe.runIf(CAPTCHA_ENABLED)('POST /api/challenge/verify', async () => {
  it('should verify a challenge successfully', async () => {
    const response = await startChallengeRequest()

    expect(response.status).toBe(200)

    const challengeId = response._data.challengeId

    const solution = await getChallengeSolution(challengeId)

    const verifyRequest = await verifyChallengeRequest({
      body: { challengeId, x: solution.x, y: solution.y },
    })

    expect(verifyRequest.status).toBe(200)
    expect(verifyRequest._data.token).toBeDefined()
  })

  it('should verify a challenge successfully with deviations', async () => {
    const response = await startChallengeRequest()

    expect(response.status).toBe(200)

    const challengeId = response._data.challengeId

    const solution = await getChallengeSolution(challengeId)
    const deviation = getChallengeDeviation()

    const verifyRequest = await verifyChallengeRequest({
      body: {
        challengeId,
        x: solution.x - deviation,
        y: solution.y - deviation,
      },
    })

    expect(verifyRequest.status).toBe(200)
    expect(verifyRequest._data.token).toBeDefined()
  })

  describe('error handling', () => {
    it('should return 400 when deviation large by x', async () => {
      const response = await startChallengeRequest()

      expect(response.status).toBe(200)

      const challengeId = response._data.challengeId

      const solution = await getChallengeSolution(challengeId)
      const deviation = getChallengeDeviation()
      const invalidDeviation = getChallengeInvalidDeviation()

      const verifyRequest = await verifyChallengeRequest({
        body: {
          challengeId,
          x: solution.x - invalidDeviation,
          y: solution.y - deviation,
        },
      })

      expect(verifyRequest.status).toBe(400)
      expect(verifyRequest._data.data.code).toBe('INVALID_CHALLENGE_SOLUTION')
    })

    it('should return 400 when deviation large by y', async () => {
      const response = await startChallengeRequest()

      expect(response.status).toBe(200)

      const challengeId = response._data.challengeId

      const solution = await getChallengeSolution(challengeId)
      const deviation = getChallengeDeviation()
      const invalidDeviation = getChallengeInvalidDeviation()

      const verifyRequest = await verifyChallengeRequest({
        body: {
          challengeId,
          x: solution.x - deviation,
          y: solution.y - invalidDeviation,
        },
      })

      expect(verifyRequest.status).toBe(400)
      expect(verifyRequest._data.data.code).toBe('INVALID_CHALLENGE_SOLUTION')
    })

    it('should return 400 when deviation large for axis', async () => {
      const response = await startChallengeRequest()

      expect(response.status).toBe(200)

      const challengeId = response._data.challengeId

      const solution = await getChallengeSolution(challengeId)
      const invalidDeviation = getChallengeInvalidDeviation()

      const verifyRequest = await verifyChallengeRequest({
        body: {
          challengeId,
          x: solution.x - invalidDeviation,
          y: solution.y - invalidDeviation,
        },
      })

      expect(verifyRequest.status).toBe(400)
      expect(verifyRequest._data.data.code).toBe('INVALID_CHALLENGE_SOLUTION')
    })
  })
})

describe.skipIf(CAPTCHA_ENABLED)('POST /api/challenge/verify (disabled)', async () => {
  it('should return 404 when challenge is disabled', async () => {
    const response = await startChallengeRequest()
    expect(response.status).toBe(404)
    expect(response._data.data.code).toBe('NOT_FOUND')
  })
})
