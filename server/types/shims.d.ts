import type { User } from '../database'

export {}
declare global {
  type H3Event = InstanceType<typeof import('../../node_modules/h3')['H3Event']>
}

declare module 'h3' {
  interface H3EventContext {
    auth?: {
      user: User
    }
  }
}
