import type {
  ProfileResource,
} from '~/server/resources/profile-resource'
import { defineStore } from 'pinia'

interface AuthStoreState {
  user: ProfileResource | null
  sessions: { uid: number, uuid: string }[]
  isLoading: boolean
}

export const useProfileStore = defineStore('profile', {
  state: (): AuthStoreState => ({
    isLoading: false,
    user: null,
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

    setStore(data: ProfileResource) {
      this.user = data
    },
  },
})
