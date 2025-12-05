import { env } from 'node:process'
import { afterAll, beforeAll } from 'vitest'

function useMailhog() {
  const self = {
    clear: async () => {
      return fetch(`${env.SETUP_MAILER_HOST}/api/v1/messages`, { method: 'DELETE' })
    },
    getMessages: async () => {
      const res = await fetch(`${env.SETUP_MAILER_HOST}/api/v2/messages`)
      return res.json()
    },
    getMessagesByEmail: async (email: string) => {
      const allMessages = await self.getMessages()

      return allMessages.items.filter((message: any) => {
        return message.Content.Headers.To.includes(email)
      })
    },
  }

  return self
}

beforeAll(() => {
  // @ts-expect-error type
  globalThis.mailhog = useMailhog()
})

afterAll(async () => {
  // @ts-expect-error type
  delete globalThis.mailhog
})

declare global {
  let mailhog: ReturnType<typeof useMailhog>
}
