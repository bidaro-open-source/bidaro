import { defineVitestProject } from '@nuxt/test-utils/config'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      await defineVitestProject({
        root: './',
        test: {
          name: 'api-e2e',
          include: ['test/api/**/*.e2e.{test,spec}.ts'],
          environment: 'node',
          globalSetup: 'test/setup.ts',
          setupFiles: [
            'test/setup-database.ts',
            'test/setup-redis.ts',
          ],
        },
      }),
    ],
  },
})
