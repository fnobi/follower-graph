module.exports = {
  root: true,
  env: {
    es6: true,
    node: true
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
    "plugin:@typescript-eslint/recommended"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json"],
    sourceType: "module"
  },
  ignorePatterns: [
    "/lib/**/*",
    "/scripts/**/*"
  ],
  plugins: [
    "@typescript-eslint",
    "import"
  ],
  rules: {
    "quotes": ["error", "double"],
    "object-curly-spacing": ["error", "always"],
    "comma-dangle": ["error", "never"],
    "require-jsdoc": 0,
    "@typescript-eslint/explicit-module-boundary-types": 0
  }
};
