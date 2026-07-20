import { defineConfig, devices } from '@playwright/test';

// E2E golden-path suite: drives the real built/dev app in a real browser
// against a real running module-api instance (see docs/specification-roadmap.md
// Phase 4) -- no mocking, same philosophy as the backend's own E2E suite.
// Requires: module-api running locally (see README.md), pointed at the real
// dev database. Not run in CI (no backend available there); local/manual only.
export default defineConfig({
  testDir: './test/e2e',
  fullyParallel: false,
  // Real finding: every spec file reuses the *same* real account (module-api's
  // auth is centralized, not per-frontend/per-file -- see the Enabling
  // infrastructure notes in docs/specification-roadmap.md). `fullyParallel:
  // false` only serializes tests *within* one file; across files, Playwright's
  // default worker count (CPU-based) still ran auth.spec.js and
  // dashboard.spec.js concurrently against the same account/session, and the
  // resulting contention made dashboard.spec.js's delete step reliably exceed
  // its 30s timeout (reproduced, then confirmed to pass immediately in
  // isolation or with `--workers=1`). Pinning to a single worker trades a
  // little wall-clock time for a suite that doesn't flake against a shared
  // real backend.
  workers: 1,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5181',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev -- --port 5181 --strictPort',
    url: 'http://localhost:5181',
    reuseExistingServer: true,
    timeout: 30000,
    env: {
      // Points the app at a local module-api instead of production --
      // see src/helpers/apiConfig.js.
      VITE_API_BASE_URL: 'http://localhost:3001/',
    },
  },
});
