import { defineStore } from 'pinia'

export interface AuthStoreState {
  isLogouting: boolean
  isRefreshing: boolean
  isAuthenticating: boolean
  access_token: string | null
  refresh_token: string | null
  session_uuid: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthStoreState => ({
    isLogouting: false,
    isRefreshing: false,
    isAuthenticating: false,
    access_token: null,
    refresh_token: null,
    session_uuid: null,
  }),
  getters: {
    isAuthenticated: state => !!state.access_token,
  },
  actions: {
    async register({ email, username, password }: any) {
      try {
        this.isAuthenticating = true

        const data = await $fetch('/api/auth/register', {
          method: 'POST',
          body: {
            email,
            username,
            password,
          },
        })

        this.access_token = data.access_token
        this.refresh_token = data.refresh_token
        this.session_uuid = data.session_uuid
      }
      finally {
        this.isAuthenticating = false
      }
    },

    async login({ username, password }: any) {
      try {
        this.isAuthenticating = true

        const data = await $fetch('/api/auth/login', {
          method: 'POST',
          body: {
            username,
            password,
          },
        })

        this.access_token = data.access_token
        this.refresh_token = data.refresh_token
        this.session_uuid = data.session_uuid
      }
      finally {
        this.isAuthenticating = false
      }
    },

    async refresh() {
      try {
        this.isRefreshing = true

        const data = await $fetch('/api/auth/refresh', {
          method: 'POST',
        })

        this.access_token = data.access_token
        this.refresh_token = data.refresh_token
        this.session_uuid = data.session_uuid
      }
      catch (err: any) {
        if (err.status !== 422)
          throw err.data
      }
      finally {
        this.isRefreshing = false
      }
    },

    async logout() {
      try {
        this.isLogouting = true

        await $fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.access_token}`,
          },
        })

        this.access_token = null
        this.refresh_token = null
        this.session_uuid = null
      }
      finally {
        this.isLogouting = false
      }
    },
  },
})
