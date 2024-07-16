import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    passWithNoTests: true,
    globalSetup: 'test/setup.ts',
    setupFiles: [
      'test/setup-database.ts',
      'test/setup-redis.ts',
    ],
  },
})
