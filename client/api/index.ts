import { createAuthApi } from './auth.api'
import { createLotsApi } from './lots.api'
import { createProfileRecoveryApi } from './profile-recovery.api'
import { createProfileSessionsApi } from './profile-sessions.api'
import { createProfileVerificationApi } from './profile-verification.api'
import { createProfileApi } from './profile.api'
import { createUsersApi } from './users.api'

/**
 * Creates an API client instance.
 *
 * @param fetch - The ofetch instance used for making HTTP requests
 * @returns An object containing API service methods
 */
export function createApi(fetch: typeof $fetch) {
  return {
    auth: createAuthApi(fetch),
    profile: createProfileApi(fetch),
    profileRecovery: createProfileRecoveryApi(fetch),
    profileVerification: createProfileVerificationApi(fetch),
    profileSessions: createProfileSessionsApi(fetch),
    lots: createLotsApi(fetch),
    users: createUsersApi(fetch),
  }
}
