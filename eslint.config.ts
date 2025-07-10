import antfu from '@antfu/eslint-config'

export default antfu(
  {
    formatters: true,
  },

  {
    rules: {
      'no-console': 'off',

      'style/padding-line-between-statements': [
        'error',
        {
          blankLine: 'always',
          prev: '*',
          next: 'return',
        },
      ],

      'sort-imports': 'off',
      'perfectionist/sort-imports': [
        'error',
        {
          partitionByNewLine: true,
          newlinesBetween: 'ignore',
        },
      ],
    },
  },

  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/coverage/**', 'logs', 'tsconfig.*'],
  },
)
