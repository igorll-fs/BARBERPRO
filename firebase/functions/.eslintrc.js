module.exports = {
  root: true,
  env: {
    es2020: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*",
    "/node_modules/**/*",
    ".eslintrc.js",
    "jest.config.js",
  ],
  plugins: [
    "@typescript-eslint",
  ],
  rules: {
    "quotes": ["error", "double"],
    "indent": ["error", 2],
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_|context|ctx", "varsIgnorePattern": "^_" }],
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_|context|ctx", "varsIgnorePattern": "^_" }],
  },
};
