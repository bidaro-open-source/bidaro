export default defineNuxtConfig({
  devtools: {
    enabled: true,
  },
  modules: [
    '@bg-dev/nuxt-s3',
  ],
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
    },
  },
})
