module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  parserOptions: {
    'parser': 'babel-eslint',
    'sourceType': 'module',
  },
  // https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
  // consider switching to `plugin:vue/strongly-recommended` or `plugin:vue/recommended` for stricter rules.
  extends: [
    'plugin:nuxt/recommended',
    'plugin:vue/essential',
    'plugin:vue/base',
    'plugin:vue/strongly-recommended',
    'plugin:vue/recommended',
  ],
  // required to lint *.vue files
  plugins: [
    'vue',
  ],
  // add your custom rules here
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
    'semi': ['error', 'never'],
    'no-shadow': 'error',
    'no-undef': 'error',
    'no-unused-vars': ['error', { vars: 'all', args: 'after-used', ignoreRestSiblings: true }],
    'no-use-before-define': ['error', { functions: true, classes: true, variables: true }],
    'space-before-function-paren': ['error', 'never'],
    'vue/html-closing-bracket-spacing': ['error', {
      'selfClosingTag': 'always',
    }],
    // allow optionalDependencies
    // allow debugger during development
    'no-debugger': (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') ? 'error' : 'off',
    'vue/script-indent': ['error', 2, { 'baseIndent': 1, 'switchCase': 1 }],
  },
}
