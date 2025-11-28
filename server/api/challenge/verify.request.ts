import z from 'zod'

export type VerifyChallengeRequest = ValidatorReturnType<typeof verifyChallengeRequest>

export const verifyChallengeRequest = createRequestValidator({
  body: z.object({
    x: z.number().min(0).max(3000),
    y: z.number().min(0).max(3000),
    challengeId: z.uuidv4(),
  }),
})
