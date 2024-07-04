import type { User } from '../database'

interface AuthorizationData {
  isAuthenticated: boolean
  user?: User
}

declare module 'h3' {
  interface H3EventContext {
    auth: AuthorizationData
  }
}
