import { defineStore } from 'pinia'

interface AuthStoreState {
  error: unknown | null
  isLoading: boolean
  user: { id: number, username: string, email: string } | null
  role: { name: string } | null
  permissions: {
    name: string
    displayName: string | null
    description: string | null
  }[]
  sessions: { uid: number, uuid: string }[]
}

export const useProfileStore = defineStore('profile', {
  state: (): AuthStoreState => ({
    error: null,
    isLoading: false,
    user: null,
    role: null,
    permissions: [],
    sessions: [],
  }),
  getters: {
    isError: state => !!state.error,
  },
  actions: {
    async fetchProfile() {
      try {
        this.error = null

        const api = useApiStore()

        const data = await api.profile.fetchProfile()

        this.setStore(data)
      }
      catch (err) {
        this.error = err
      }
      finally {
        this.isLoading = false
      }
    },

    async fetchSessions() {
      try {
        this.error = null

        const api = useApiStore()

        const data = await api.profile.fetchSessions()

        this.sessions = data
      }
      catch (err) {
        this.error = err
      }
      finally {
        this.isLoading = false
      }
    },

    async deleteSessions(uuid: string) {
      try {
        this.error = null

        const api = useApiStore()

        const data = await api.profile.deleteSessions({
          body: { uuids: [uuid] },
        })

        if (!data[0]) {
          throw new Error('Deleting is not success')
        }

        this.sessions = this.sessions.filter(s => s.uuid !== uuid)
      }
      catch (err) {
        this.error = err
      }
      finally {
        this.isLoading = false
      }
    },

    setStore(data: Omit<AuthStoreState, 'error' | 'isLoading' | 'sessions'>) {
      this.user = data.user
      this.role = data.role
      this.permissions = data.permissions
    },
  },
})
