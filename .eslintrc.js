module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: [
    '@nuxtjs',
    '@nuxtjs/eslint-config-typescript',
    'plugin:nuxt/base',
    'plugin:nuxt/recommended',
  ],
  rules: {
    // don't require .vue extension when importing
    // disallow reassignment of function parameters
    // disallow parameter object manipulation except for specific exclusions
    'no-param-reassign': ['error', {
      props: true,
      ignorePropertyModificationsFor: [
        'state', // for vuex state
        'acc', // for reduce accumulators
        'e', // for e.returnvalue
      ],
    }],
    'object-curly-spacing': ['error', 'always'],
    'eqeqeq': ['error', 'always', { null: 'ignore' }],
    'no-multi-spaces': 'error',
    'radix': 'error',
    'no-unreachable': 'error',
    'no-extra-semi': 'error',
    'arrow-spacing': ['error', { before: true, after: true }],
    'no-var': 'error',
    'object-shorthand': ['error', 'always', {
      ignoreConstructors: false,
      avoidQuotes: false,
    }],
    'prefer-const': ['error', {
      destructuring: 'any',
      ignoreReadBeforeAssign: true,
    }],
    'prefer-template': 'error',
    'rest-spread-spacing': ['error', 'never'],
    'comma-dangle': ['error', {
      arrays: 'always-multiline',
      objects: 'always-multiline',
      imports: 'always-multiline',
      exports: 'always-multiline',
      functions: 'always-multiline',
    }],
    'no-trailing-spaces': 'error',
    'eol-last': ['error', 'always'],
    'quotes': ['error', 'single', { avoidEscape: true }],
    // 'semi': ['error', 'never'],
    'no-shadow': 'error',
    'no-undef': 'error',
    'no-use-before-define': ['error', { functions: true, classes: true, variables: true }],
    'space-before-function-paren': ['error', 'never'],
    'vue/html-closing-bracket-spacing': ['error', {
      'selfClosingTag': 'always',
    }],
    // allow optionalDependencies
    // allow debugger during development
    'no-debugger': (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') ? 'error' : 'off',
    'nuxt/no-cjs-in-config': 'off',
    'no-case-declarations': 'off',
    'camelcase': 'off',
    'no-template-curly-in-string': 'off',
    'no-unused-vars': ['error', {'args': 'after-used'}],
    'no-useless-computed-key': 'off',
    'semi': 'off',
    '@typescript-eslint/no-unused-vars': ['error', {'args': 'after-used'}],
  },
  'overrides': [
    {
      'files': ['**/*.ts', '**/*.tsx'],
      'rules': {
        'no-unused-vars': ['off'],
        'no-undef': ['off'],
      },
    },
  ],
}
