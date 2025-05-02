import { defineStore } from 'pinia'

interface AuthStoreState {
  sessions: { uid: number, uuid: string }[]
}

export const useSessionsStore = defineStore('profile:sessions', {
  state: (): AuthStoreState => ({
    sessions: [],
  }),
  actions: {
    async fetchSessions() {
      const api = useApiStore()

      const data = await api.profile.fetchSessions()

      this.sessions = data
    },

    async deleteSessions(uuid: string) {
      const api = useApiStore()

      const data = await api.profile.deleteSessions({
        body: { uuids: [uuid] },
      })

      if (!data[0]) {
        throw new Error('Deleting is not success')
      }

      this.sessions = this.sessions.filter(s => s.uuid !== uuid)
    },
  },
})
