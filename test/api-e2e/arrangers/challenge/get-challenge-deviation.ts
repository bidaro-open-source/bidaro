import { challengeService } from '~~/server/domains/security/challenge/challenge.service'

export function getChallengeDeviation() {
  return challengeService.tolerance
}
