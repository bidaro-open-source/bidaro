import { challengeService } from '~~/server/domains/security/challenge/challenge.service'

export function getChallengeInvalidDeviation() {
  return challengeService.tolerance + 1
}
