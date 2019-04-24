module.exports = {
  root: true,
  env: {
    browser: true,
    es6: true,
    node: true,
    jest: true,
  },
  globals: {
    Cypress: true,
    cy: true,
    ENV: true,
  },
  extends: ['airbnb-base', 'plugin:vue/recommended'],
  plugins: ['prettier', 'json'],
  parserOptions: {
    parser: 'babel-eslint',
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.vue', '.json'],
      },
    },
  },
  rules: {
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    rules: {
      'prettier/prettier': ['error'],
    },
    'arrow-parens': ['error', 'as-needed'],
    'no-shadow': ['warn'],
    'consistent-return': ['warn'],
    'operator-linebreak': 'off',
    'space-before-function-paren': 'off',
    'function-paren-newline': 'off',
    'object-curly-newline': 'off',
    'implicit-arrow-linebreak': 'off',
    'no-empty': 'warn',
    'class-methods-use-this': 'off',
    'no-underscore-dangle': 'off',
    'max-len': [
      'warn',
      80,
      2,
      {
        ignoreUrls: true,
        ignoreComments: false,
        ignoreRegExpLiterals: true,
        ignoreStrings: false,
        ignoreTemplateLiterals: false,
      },
    ],
    'func-names': 0,
    'no-param-reassign': [
      'error',
      {
        props: true,
        ignorePropertyModificationsFor: ['state'],
      },
    ],
    'import/no-unresolved': [
      'error',
      {
        ignore: ['@', 'fixtures', 'mocks'],
      },
    ],
    'vue/max-attributes-per-line': [
      'error',
      {
        singleline: 1,
        multiline: {
          max: 1,
          allowFirstLine: false,
        },
      },
    ],
    'vue/html-closing-bracket-newline': [
      'error',
      {
        singleline: 'never',
        multiline: 'always',
      },
    ],
    'vue/order-in-components': [
      'error',
      {
        order: [
          'el',
          'name',
          'inheritAttrs',
          'inject',
          'provide',
          ['props', 'propsData'],
          'data',
          'computed',
          'watch',
          'methods',
          'LIFECYCLE_HOOKS',
          'mixins',
          'components',
          [
            'functional',
            'delimiters',
            'comments',
            'directives',
            'filters',
            'parent',
            'extends',
            'model',
            'template',
            'render',
            'renderError',
          ],
        ],
      },
    ],
  },
  overrides: [
    {
      files: ['*.spec.js'],
      rules: {
        'global-require': 'off',
      },
    },
  ],
};
