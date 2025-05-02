import { defineStore } from 'pinia'

interface AuthStoreState {
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
    isLoading: false,
    user: null,
    role: null,
    permissions: [],
    sessions: [],
  }),
  actions: {
    async fetchProfile() {
      try {
        const api = useApiStore()

        const data = await api.profile.fetchProfile()

        this.setStore(data)
      }
      finally {
        this.isLoading = false
      }
    },

    async fetchSessions() {
      try {
        const api = useApiStore()

        const data = await api.profile.fetchSessions()

        this.sessions = data
      }
      finally {
        this.isLoading = false
      }
    },

    async deleteSessions(uuid: string) {
      try {
        const api = useApiStore()

        const data = await api.profile.deleteSessions({
          body: { uuids: [uuid] },
        })

        if (!data[0]) {
          throw new Error('Deleting is not success')
        }

        this.sessions = this.sessions.filter(s => s.uuid !== uuid)
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
