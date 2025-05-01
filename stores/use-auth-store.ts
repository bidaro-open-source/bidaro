import { defineStore } from 'pinia'
import { decodeJwt } from '~/uitls/decode-jwt'

interface AuthResponse {
  access_token: string
  session_uuid: string
}

interface AuthStoreState {
  isLogouting: boolean
  isRefreshing: boolean
  isAuthenticating: boolean
  sessionUuid: string | null
  accessToken: string | null
  accessTokenExp: number | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthStoreState => ({
    isLogouting: false,
    isRefreshing: false,
    isAuthenticating: false,
    accessToken: null,
    accessTokenExp: null,
    sessionUuid: null,
  }),
  getters: {
    isAuthenticated: state => !!state.accessToken,

    isTokenExpiring(): boolean {
      if (this.accessTokenExp) {
        const accessTokenExpDate = this.accessTokenExp - 30
        const nowTime = Math.floor(Date.now() / 1000)
        return accessTokenExpDate <= nowTime
      }

      return false
    },
  },
  actions: {
    setStore(data: AuthResponse) {
      const payload = decodeJwt<{ uid: number, exp: number }>(data.access_token)

      if (!payload)
        throw new Error('Invalid jwt access token')

      this.accessToken = data.access_token
      this.accessTokenExp = payload.exp
      this.sessionUuid = data.session_uuid
    },

    async register({ email, username, password }: any) {
      try {
        this.isAuthenticating = true

        const data = await useApi('/api/auth/register', {
          method: 'POST',
          body: {
            email,
            username,
            password,
          },
        })

        this.setStore(data)
      }
      finally {
        this.isAuthenticating = false
      }
    },

    async login({ username, password }: any) {
      try {
        this.isAuthenticating = true

        const data = await useApi('/api/auth/login', {
          method: 'POST',
          body: {
            username,
            password,
          },
        })

        this.setStore(data)
      }
      finally {
        this.isAuthenticating = false
      }
    },

    async refresh() {
      try {
        this.isRefreshing = true

        const data = await useApi('/api/auth/refresh', { method: 'POST' })

        this.setStore(data)
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

        await useApi('/api/auth/logout', { method: 'POST' })

        this.$reset()
      }
      finally {
        this.isLogouting = false
      }
    },
  },
})
