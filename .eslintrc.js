module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/essential',
    'eslint:recommended'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    "indent": ["error", 2],
    "keyword-spacing": "error",
    "key-spacing": "error",
    "space-before-blocks": "error",
    "no-trailing-spaces": "error",
    "no-unreachable": "error",
    "no-var": "error",
    "semi": ["error", "always"],
    "sort-vars": "error",
    "sort-imports": "error",
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
};
