import type { ProfileResource } from '~~/server/modules/users'
import { defineStore } from 'pinia'
import { decodeJwt } from '~/uitls/decode-jwt'

interface AuthResponse {
  user: ProfileResource
  access_token: string
  session_uuid: string
}

interface AuthStoreState {
  user: ProfileResource | null
  isRefreshing: boolean
  isAuthenticating: boolean
  sessionUuid: string | null
  accessToken: string | null
  accessTokenExp: number | null
}

let authStoreSync = () => {}

const TOKEN_EXPIRATION_BUFFER = 30 // 30 seconds

export const useAuthStore = defineStore('auth', {
  state: (): AuthStoreState => ({
    user: null,
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
        const accessTokenExpDate = this.accessTokenExp - TOKEN_EXPIRATION_BUFFER
        const nowTime = Math.floor(Date.now() / 1000)
        return accessTokenExpDate <= nowTime
      }

      return false
    },
  },
  actions: {
    async fetchProfile() {
      try {
        const { $api } = useNuxtApp()

        const data = await $api.profile.fetchProfile()

        this.user = data
      }
      finally {
        this.sync()
      }
    },

    async register({ email, username, password }: any) {
      try {
        const { $api } = useNuxtApp()

        this.isAuthenticating = true

        const data = await $api.auth.register({
          body: { email, username, password },
        })

        this.setStore(data)
      }
      finally {
        this.isAuthenticating = false
        this.sync()
      }
    },

    async login({ username, password }: any) {
      try {
        const { $api } = useNuxtApp()

        this.isAuthenticating = true

        const data = await $api.auth.login({
          body: { username, password },
        })

        this.setStore(data)
      }
      finally {
        this.isAuthenticating = false
        this.sync()
      }
    },

    async refresh() {
      try {
        const { $api } = useNuxtApp()

        this.isRefreshing = true
        this.isAuthenticating = true

        const data = await $api.auth.refresh()

        this.setStore(data)
      }
      catch (err: any) {
        this.$reset()
        if (err.statusCode !== 422)
          throw err
      }
      finally {
        this.isAuthenticating = false
        this.isRefreshing = false
        this.sync()
      }
    },

    async logout() {
      try {
        const { $api } = useNuxtApp()

        await $api.auth.logout()

        this.$reset()
      }
      finally {
        this.sync()
      }
    },

    setStore(data: AuthResponse) {
      const payload = decodeJwt<{ uid: number, exp: number }>(data.access_token)

      if (!payload)
        throw new Error('Invalid jwt access tokden')

      this.user = data.user
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
