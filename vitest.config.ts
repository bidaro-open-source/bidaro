import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    passWithNoTests: true,
    globalSetup: 'tests/setup.ts',
    setupFiles: [
      'tests/setup-database.ts',
      'tests/setup-redis.ts',
    ],
  },
})
