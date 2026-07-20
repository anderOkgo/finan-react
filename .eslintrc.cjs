/* eslint-env node */

module.exports = {
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    // Destructuring-to-omit-a-key is used deliberately in a few places;
    // underscore-prefixed names mark that intent explicitly, so exempt
    // them instead of flagging as dead (matches animecream-react's config).
    'no-unused-vars': ['error', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],
  },
  overrides: [
    {
      // Vitest's globals: true exposes describe/it/expect/vi at runtime;
      // Jest's env covers the same API surface for lint purposes.
      files: ['**/*.test.jsx', '**/*.test.js'],
      env: { jest: true },
    },
    {
      // Playwright specs run in Node (not the browser) and read
      // process.env for E2E credentials.
      files: ['test/e2e/**/*.spec.js'],
      env: { node: true, browser: false },
    },
  ],
}
