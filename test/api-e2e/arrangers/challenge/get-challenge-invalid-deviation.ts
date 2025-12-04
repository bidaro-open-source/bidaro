import { challengeService } from '#domains/security'

export function getChallengeInvalidDeviation() {
  return challengeService.tolerance + 1
}
