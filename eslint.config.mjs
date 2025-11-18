import antfu from '@antfu/eslint-config'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  antfu({
    stylistic: {
      indent: 2,
      quotes: 'single',
      semi: false,
    },
    vue: {
      overrides: {
        'vue/html-indent': 'warn',
        'vue/html-self-closing': 'off',
        'vue/block-order': ['error', {
          order: ['script', 'template', 'style'],
        }],
        'vue/no-restricted-syntax': ['error', {
          selector: 'VElement[name=\'a\']',
          message: 'Use NuxtLink instead.',
        }],
      },
    },
    typescript: {
      overrides: {
        'ts/no-unused-expressions': [
          'off',
          {
            allowShortCircuit: true,
            allowTernary: true,
            allowTaggedTemplates: true,
            enforceForJSX: false,
          },
        ],
      },
    },
    rules: {
      'test/prefer-lowercase-title': 'off',
      'no-console': 'off',
      'unused-imports/no-unused-vars': [
        'error',
        {
          caughtErrors: 'none',
        },
      ],
    },
    formatters: {
      css: true,
      svg: false,
      html: false,
      astro: false,
      slidev: false,
      markdown: false,
      graphql: false,
      xml: false,
    },
    ignores: [
      '.git/**',
      '.github/**',
      '.hooks/**',
      '.nuxt/**',
      '.vscode/**',
      'public/**',
      'package.json',
    ],
    astro: false,
    jsonc: false,
    react: false,
    svelte: false,
    unocss: false,
    unicorn: false,
    solid: false,
  }),
)
