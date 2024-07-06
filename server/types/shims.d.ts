interface AuthorizationData {
  isAuthenticated: boolean
  assessToken?: JsonWebToken
  uid?: JsonWebTokenPayload['uid']
}

declare module 'h3' {
  interface H3EventContext {
    auth: AuthorizationData
  }
}
