import { defineVitestProject } from '@nuxt/test-utils/config'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      await defineVitestProject({
        root: './',
        test: {
          name: 'api-e2e',
          include: [
            'server/api/**/*.{test,spec}.ts',
            'test/api-e2e/**/*.{test,spec}.ts',
          ],
          environment: 'node',
          globalSetup: 'test/api-e2e/setup.ts',
          setupFiles: [
            'test/api-e2e/setup-redis.ts',
            'test/api-e2e/setup-mailhog.ts',
            'test/api-e2e/setup-database.ts',
            'test/api-e2e/setup-object-storage.ts',
          ],
        },
      }),
    ],
  },
})
