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
  error: unknown | null
}

let authStoreSync = () => {}

export const useAuthStore = defineStore('auth', {
  state: (): AuthStoreState => ({
    isLogouting: false,
    isRefreshing: false,
    isAuthenticating: false,
    accessToken: null,
    accessTokenExp: null,
    sessionUuid: null,
    error: null,
  }),
  getters: {
    sync: () => authStoreSync,

    isError: state => !!state.error,

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
    async register({ email, username, password }: any) {
      try {
        const api = useApiStore()
        const profile = useProfileStore()

        this.isAuthenticating = true

        const data = await api.auth.register({
          body: { email, username, password },
        })

        this.setStore(data)
        profile.setStore(data)
      }
      catch (err) {
        this.error = err
      }
      finally {
        this.isAuthenticating = false
        this.sync()
      }
    },

    async login({ username, password }: any) {
      try {
        const api = useApiStore()
        const profile = useProfileStore()

        this.isAuthenticating = true

        const data = await api.auth.login({
          body: { username, password },
        })

        this.setStore(data)
        profile.setStore(data)
      }
      catch (err) {
        this.error = err
      }
      finally {
        this.isAuthenticating = false
        this.sync()
      }
    },

    async refresh() {
      try {
        const api = useApiStore()
        const profile = useProfileStore()

        this.isRefreshing = true

        const data = await api.auth.refresh()

        this.setStore(data)
        profile.setStore(data)
      }
      catch (err: any) {
        if (err.response.status !== 422)
          this.error = err
      }
      finally {
        this.isRefreshing = false
        this.sync()
      }
    },

    async logout() {
      try {
        const api = useApiStore()
        const profile = useProfileStore()

        this.isLogouting = true

        await api.auth.logout()

        this.$reset()
        profile.$reset()
      }
      catch (err) {
        this.error = err
      }
      finally {
        this.sync()
      }
    },

    setStore(data: AuthResponse) {
      const payload = decodeJwt<{ uid: number, exp: number }>(data.access_token)

      if (!payload)
        throw new Error('Invalid jwt access tokden')

      this.accessToken = data.access_token
      this.accessTokenExp = payload.exp
      this.sessionUuid = data.session_uuid
    },

    useSynchronize() {
      return {
        onMessage: (data: string) => this.$patch(JSON.parse(data)),
        setEmmiter: (emitter: (data: string) => void) => {
          authStoreSync = () => emitter(JSON.stringify(this.$state))
        },
        unsetEmmiter: () => { authStoreSync = () => {} },
      }
    },
  },
})
