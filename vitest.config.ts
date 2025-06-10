import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  root: './',
  test: {
    include: ['test/**/*.test.ts'],
    passWithNoTests: true,
    globalSetup: 'test/setup.ts',
    setupFiles: [
      'test/setup-database.ts',
      'test/setup-redis.ts',
    ],
  },
})
