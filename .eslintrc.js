module.exports = {
  extends: 'airbnb-base',

  plugins: [
    'mocha',
  ],

  env: {
    mocha: true,
    node: true,
    es6: true,
  },

  rules: {
    semi: ['error', 'never'],
    'linebreak-style': ['error', 'windows'],
    'no-use-before-define': ['error', { functions: false }],
    'no-plusplus': 'off',
    'no-underscore-dangle': 'off',
  },
}
