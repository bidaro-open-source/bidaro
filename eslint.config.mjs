import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  stylistic: {
    indent: 2,
    quotes: 'single',
  },
  formatters: {
    css: true,
  },
  vue: {
    overrides: {
      'vue/no-restricted-syntax': ['error', {
        selector: 'VElement[name=\'a\']',
        message: 'Use NuxtLink instead.',
      }],
    },
  },
  ignores: [
    '.github/**',
    '.hooks/**',
    '.nuxt/**',
    '.vscode/**',
    'public/**',
  ],
  rules: {
    'no-console': 'off',
    'vue/html-indent': 'warn',
    'vue/html-self-closing': 'off',
    'max-len': ['error', { code: 80 }],
    'ts/no-unused-expressions': [
      'off',
      {
        allowShortCircuit: true,
        allowTernary: true,
        allowTaggedTemplates: true,
        enforceForJSX: false,
      },
    ],
    'unused-imports/no-unused-vars': [
      'error',
      {
        caughtErrors: 'none',
      },
    ],
  },
})
