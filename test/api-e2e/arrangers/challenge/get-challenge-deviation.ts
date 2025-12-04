import { challengeService } from '#domains/security'

export function getChallengeDeviation() {
  return challengeService.tolerance
}
