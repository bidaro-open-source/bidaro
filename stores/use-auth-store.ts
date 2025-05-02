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

let authStoreSync = () => {}

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
    sync: () => authStoreSync,

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
        profile.setStore(data.user)
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
        profile.setStore(data.user)
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
        profile.setStore(data.user)
      }
      catch (err: any) {
        if (err.statusCode !== 422)
          throw err
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
