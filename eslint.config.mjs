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
    'public/**',
  ],
  rules: {
    'no-console': 'off',
    'vue/html-indent': 'warn',
    'vue/html-self-closing': 'off',
    'max-len': ['error', { code: 80 }],
  },
})
