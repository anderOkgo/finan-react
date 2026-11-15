import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import versionJson from './scripts/version-json.mjs'

// https://vitejs.dev/config/
export default defineConfig({
  // versionJson: dist/version.json with the commit that was built (playbook v2.11, D.1).
  plugins: [react(), versionJson()],
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
      // Playbook §4 and E.8: 100%, so any new untested line fails the build.
      thresholds: { statements: 100, branches: 100, functions: 100, lines: 100 },
    },
  },
})
