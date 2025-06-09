export default defineNuxtConfig({
  srcDir: 'client',

  future: {
    compatibilityVersion: 4,
  },

  devtools: {
    enabled: true,
  },

  modules: [
    '@nuxt/ui',
    '@nuxt/eslint',
    '@pinia/nuxt',
    '@bg-dev/nuxt-s3',
  ],

  css: [
    '~/assets/stylesheets/main.css',
  ],

  colorMode: {
    preference: 'system',
    storage: 'cookie',
  },

  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  routeRules: {
    '/creation/**': { ssr: false },
    '/profile/**': { ssr: false },
    '/api/**': { cors: true },
  },

  s3: {
    driver: 's3',
    server: false,
  },

  runtimeConfig: {
    db: {
      host: '',
      port: '',
      database: '',
      username: '',
      password: '',
      connection: '',
    },
    redis: {
      host: '',
      port: '',
      user: '',
      pass: '',
    },
    s3: {
      bucket: '',
      region: '',
      endpoint: '',
      accessKeyId: '',
      secretAccessKey: '',
    },
    mailer: {
      user: '',
      pass: '',
      host: '',
      port: '',
      encryption: '',
      fromAddress: '',
      fromName: '',
    },
    jwt: {
      secret: '',
      accessTTL: '',
      refreshTTL: '',
      refreshSize: '',
    },
    password: {
      resetTTL: '',
      resetSize: '',
      hashRounds: '',
    },
    email: {
      tokenSize: '',
    },
    public: {
      appUrl: '',
    },
  },

  eslint: {
    config: {
      standalone: false,
    },
  },

  compatibilityDate: '2025-04-29',
})
