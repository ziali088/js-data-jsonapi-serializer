module.exports = {
  env: {
    browser: true,
    es6: true,
    mocha: true,
  },
  extends: [
    'airbnb-base',
  ],
  plugins: [
    'chai-friendly',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    "prefer-rest-params": "off",
    "no-unused-expressions": "off",
    "chai-friendly/no-unused-expressions": 2,
    "no-underscore-dangle": "off",
    "class-methods-use-this": "off",
  },
};
