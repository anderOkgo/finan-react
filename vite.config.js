import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.js'],
    // test/e2e/*.spec.js are Playwright specs (run via `npm run test:e2e`,
    // a separate process/API) -- Vitest's default include glob also
    // matches `*.spec.js`, so without this it tries to run them too and
    // fails immediately on Playwright's `test`/`expect` imports.
    exclude: ['node_modules/**', 'test/e2e/**'],
    // Same fix as animecream-react: GitHub Actions' shared runners are far
    // more CPU-constrained than a dev machine, and user-event-driven tests
    // reproducibly exceeded Vitest's 5000ms default under a `--cpus=2`
    // Docker container matching the runner's resources.
    testTimeout: 15000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      // Every source file counts, tested or not (Vitest 4 only reports the files a test loads
      // unless `include` is set), as in bitacora-react. main.jsx only mounts App.
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/**/__tests__/**', 'src/main.jsx'],
      // Playbook §4: 100%. Negative numbers are the most uncovered items allowed: the one statement
      // and five branches no test can reach, listed in docs/changes/20261114-finan-coverage-100.md
      // (production code is not changed to reach them).
      thresholds: {
        lines: 100,
        functions: 100,
        statements: -1,
        branches: -5,
      },
    },
  },
})
