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
      // Set from the real aggregate as of Phase 2.5's completion --
      // statements 85.88 / branches 76.79 / functions 82.78 / lines 86.22
      // (`npm run test:cov`) -- a few points below each, mirroring
      // animecream-react's own vite.config.js reasoning: enough margin to
      // not go flaky on normal fluctuation (a test or two being skipped,
      // minor branch-count drift), tight enough that a large new untested
      // file (the kind of regression this gate exists to catch) still
      // fails the build.
      thresholds: {
        statements: 82,
        branches: 72,
        functions: 78,
        lines: 82,
      },
    },
  },
})
