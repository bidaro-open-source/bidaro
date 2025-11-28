import { v4 as uuidv4 } from 'uuid'

export function createChallengeInvalidToken() {
  return uuidv4()
}
