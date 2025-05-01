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
}

export const useProfileStore = defineStore('profile', {
  state: (): AuthStoreState => ({
    error: null,
    isLoading: false,
    user: null,
    role: null,
    permissions: [],
  }),
  getters: {
    isError: state => !!state.error,
  },
  actions: {
    async fetchProfile() {
      try {
        const api = useApiStore()

        const data = await api.profile.fetchProfile()

        this.setStore(data)
      }
      catch (err) {
        this.error = err
      }
      finally {
        this.isLoading
      }
    },

    setStore(data: Omit<AuthStoreState, 'error' | 'isLoading'>) {
      this.user = data.user
      this.role = data.role
      this.permissions = data.permissions
    },
  },
})
