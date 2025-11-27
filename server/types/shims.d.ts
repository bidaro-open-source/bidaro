import type { userSource } from '#domains/users'

export {}
declare global {
  type H3Event = InstanceType<typeof import('../../node_modules/h3')['H3Event']>
  type H3Error = InstanceType<typeof import('../../node_modules/h3')['H3Error']>
}

declare module 'h3' {
  interface H3EventContext {
    auth?: {
      user: Awaited<ReturnType<typeof userSource.getByPkWithAuth>>
    }
  }
}
