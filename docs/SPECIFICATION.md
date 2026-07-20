# Design Specification

**What this is**: the *generative* rules — how to shape new code so it belongs in this codebase, not a description of what already exists. `README.md` is descriptive ("here's how to run it"); this file is the remaining piece — the conventions an implementer (human or AI) must follow so that a from-scratch regeneration, or a new component bolted onto this one, *feels like* it was written by the same hand, not just renders the same pixels.

Every rule below was extracted by reading the actual code, not designed on a whiteboard. Where the codebase is internally inconsistent, that's recorded honestly in "Known deviations" at the end, rather than papered over. This document also cross-references `animecream-react` — the sibling frontend, same author, same backend, built at a different time — wherever the two disagree on something a regenerator might assume is a shared convention. It isn't always one.

## 1. Component shape: `components/<Name>/<Name>.jsx` + co-located `.css`

Every component lives in its own folder under `src/components/` (lowercase `components`, unlike `animecream-react`'s `Components` — see "Known deviations"), named like the component, containing `<Name>.jsx` and (if it has non-trivial markup) `<Name>.css` imported directly at the top of the file. Functional components only, no class components. Props are destructured directly in the function signature, never accessed via a `props` object.

**PropTypes are the real majority convention here** — 19 of 31 component files declare `.propTypes` with a real `import PropTypes from 'prop-types'` (unlike `animecream-react`, where it's a 5-of-25 minority; see that repo's `docs/SPECIFICATION.md` §1). A new component in this repo should add PropTypes by default, matching the majority pattern — the inverse default from `animecream-react`, despite both apps otherwise looking similar. Don't assume the two sibling repos share this convention; check each one's own ratio before following either as a template for the other.

## 2. State management: `GlobalContext`, used pervasively — the opposite default from `animecream-react`

This app has one `React.createContext({})` (`src/contexts/GlobalContext.jsx` — 3 lines, no reducer, no logic of its own; see `docs/specification-roadmap.md`'s Phase 2.5 note about this being incorrectly assumed to have reducer logic before the file was actually read). `App.jsx` is the single `<GlobalContext.Provider>`, populated with one flat object: `init`, `setInit`, `proc`, `setProc`, `toggleDarkMode`, `saveThemeAsDefault`, `restoreThemeDefault`, `boot`, `username`, `role`, `language`, `toggleLanguage`, `saveLanguageAsDefault`, `restoreLanguageDefault`, `t`, `navigation`, `isDarkMode`. Ten-plus components consume it directly via `useContext(GlobalContext)` — `Login`, `Register`, `LineChart`, `Form`, `Home`, `Menu`, `Tab`, `Table`, `TablePagination`, `TableSearch` — rather than receiving these as props.

This is the **opposite default from `animecream-react`**, which has no app-wide Context at all and prop-drills everything except language (see that repo's §2). A new component here that needs `t`/`navigation`/`init`/etc. should pull it from `GlobalContext` directly, not have it threaded through as a prop by its parent — that's the established pattern in this app, even though the sibling app does the opposite. **One real, confirmed footgun from this pattern**: because `GlobalContext`'s default value is `{}` (not `null`), a component rendered without a `<GlobalContext.Provider>` ancestor gets `t === undefined` and crashes on the first `t(...)` call rather than failing loudly/obviously — found while writing `TablePagination.jsx`'s tests (see `docs/specification-roadmap.md`'s Phase 2.5). Every component that reads from `GlobalContext` implicitly assumes the real app's single top-level Provider is always present; this holds in production today, but a component reused outside that tree (a Storybook story, a different test harness) needs its own `<GlobalContext.Provider value={...}>` wrapper to avoid this exact crash.

## 3. Hooks: `src/hooks/use<Name>.jsx`, one file per hook, plain functions

Every hook is `export const use<Name> = () => { ... }` in its own file, named `use<Name>.jsx` (note: **`.jsx`, not `.js`** — the opposite extension from `animecream-react`'s equivalent hooks, even though neither app's hook files render JSX directly; see "Known deviations"). A hook returns a plain object of values/setters/callbacks. No hook-to-hook composition beyond React's own built-ins; no hook here exports its own Context (unlike `animecream-react`'s `useLanguage.js` — this app's language state lives in `GlobalContext` instead, per §2, so `useLanguage.jsx` here is a plain hook, not a Context-plus-Provider pair).

## 4. The `services/` layer: this app's only contract with `module-api`

`src/services/auth.service.js` and `src/services/data.service.js` are the only files that know about authentication/session mechanics and the `finan` module's CRUD endpoints respectively. Every real API call follows the same shape: `helpHttp.<method>(url, { body, token, timeout })`, checks `response?.err` on return (never a thrown exception for an expected API-level failure), reads/writes the JWT via `AuthService.getCurrentUser()` (§5's `cyfer`-encrypted `localStorage` entry, identical mechanism to `animecream-react`'s).

**`helpHttp.js` here is an older, simpler version than `animecream-react`'s copy of the same file** — no `FormData`/multipart support (not needed; this app never uploads files), no `AbortController`-based timeout handling, plainer error-message extraction. Not a bug — this app genuinely doesn't need multipart uploads — but a future feature that *does* need file upload here should look at `animecream-react`'s `helpHttp.js` as the reference implementation to port forward, not reinvent it.

## 5. `API_BASE_URL`, not `set.json`'s `base_url` directly

Same fix, same reasoning, as `animecream-react` (see that repo's §5): `set.json`'s `base_url` is hardcoded to production with no built-in override, so `src/helpers/apiConfig.js` exports `API_BASE_URL = import.meta.env.VITE_API_BASE_URL || set.base_url`. Only 2 files needed migrating here (`auth.service.js`, `data.service.js`) versus 6 in `animecream-react` — this app makes no direct `helpHttp` calls outside the `services/` layer (unlike `animecream-react`'s `Home.jsx`/`AdminPanel.jsx`/etc., which call the API directly). **A new file making its own HTTP calls should still go through `services/`, following this app's existing discipline, rather than reaching for `set.base_url`/`API_BASE_URL` directly the way `animecream-react` allows.**

## 6. `react-router-dom` is installed and wraps the app, but drives nothing

`main.jsx` wraps `<App />` in a `<BrowserRouter>`, and `react-router-dom` is a real `package.json` dependency — but **no component anywhere uses `<Route>`, `useNavigate`, `useParams`, or any other router API.** "Navigation" (which tab is active, browser-back behavior) is handled entirely by this app's own `useNavigationHistory` hook plus `Tab.jsx`'s local `selectedOption` state, not by URL routes. A regenerator should not assume this app is meaningfully route-driven just because `react-router-dom` is present — it's installed infrastructure for a routing model this app doesn't actually use today. Don't add a new page as a new `<Route>` without first confirming whether that's actually wanted, versus following the existing tab-based pattern.

## 7. `localStorage` conventions

| Key(s) | Owner | Purpose |
|---|---|---|
| `cyfer().cy('user-in', formattedDate())` (a computed key) | `auth.service.js` | The logged-in user's JWT + response payload, `cyfer`-encrypted with `set.salt` — identical mechanism to `animecream-react`. |
| `storage` | `Tab.jsx` | Cached `initial-load` response, `cyfer`-encrypted. **Single-tier**, unlike `animecream-react`'s `storage`/`storage_initial` two-tier cache (§6 of that repo's spec) — this app has no equivalent "immutable first-load snapshot" concept. |
| `insert` / `update` / `del` | `Form.jsx` | The offline mutation queue — movements the user submitted while offline (or while `init`/`proc` weren't ready), replayed via `handleBulkData`/`handleRowDoubleClick` once back online. No equivalent exists in `animecream-react`, which has no offline-write concept at all (its catalog is read-only for non-admins, and `AdminPanel`'s writes have no offline queue). |
| `count_down` | `CountDownEnd.jsx` | Cached countdown-display data, `cyfer`-encrypted. |
| `lang`, `themePreference` | `useLanguage.jsx`, `useTheme.jsx` | Explicit user overrides of the system default — same double-click-to-toggle-default UX and same key names as `animecream-react`. |

## 8. Testing: Vitest (unit/component) + Playwright (E2E), never mixed in one file

Same split as `animecream-react` (see that repo's §7): `__tests__/` folders next to the file they cover, `test/e2e/*.spec.js` for Playwright, excluded from Vitest via `vite.config.js`'s `test.exclude`. The one E2E-specific difference: this app has **no public/unauthenticated view** (`Home.jsx` renders the login form directly whenever `GlobalContext.username` is unset), so every E2E spec except the "shows the login form when logged out" case needs real credentials — `.env.e2e.local`, gitignored, `--env-file-if-exists`-loaded, same pattern and even the *same account* as `animecream-react`'s (auth is centralized across `module-api`'s modules, not per-frontend). `dashboard.spec.js` (movement CRUD) mutates this real account's real financial data and cleans up via a real hard-delete (`afterEach`, backed by the UI's own real Delete button when the happy path completes, with an API-level safety net for failed runs) — see `docs/specification-roadmap.md`'s Phase 4 notes on this being a hard-delete, unlike `animecream-react`'s soft-delete-only series.

## Known deviations (tracked here so a regeneration doesn't copy them as if they were intentional)

| Deviation | Where | Disposition |
|---|---|---|
| Component folder is `components/` (lowercase) here, `Components/` (capitalized) in `animecream-react` | Both repos | Not unified — cosmetic, case-only. Pick one per app; don't assume the sibling matches. |
| Hook files use `.jsx` here, `.js` in `animecream-react`, for the same kind of file | Both repos | Not unified — cosmetic, not functional. |
| `helpHttp.js` here is an older, simpler version than `animecream-react`'s (no multipart/timeout support) | This repo | Not synced — see §4. Not a bug (this app has no file-upload feature today), but the gap to close if one is ever added. |
| `GlobalContext`'s default value (`{}`, not `null`) lets components render outside a Provider with silently-`undefined` values instead of a clear error | This repo | Not fixed — see §2's footgun note. A component genuinely meant to be usable outside the real app tree would need this addressed; nothing in the current app needs that. |
| `TablePagination.jsx` had the same optional-`navigation`-dereferenced-unconditionally crash bug as `animecream-react`'s copy | This repo | **Fixed** in Phase 2.5 (2026-07-19) — see `docs/specification-roadmap.md`. |

---

**Companion documents**: `README.md` (how to run/test/deploy), `docs/specification-roadmap.md` (how and why any of this changed, day by day, including every bug this document's rules were extracted while fixing).

**Last verified against source**: 2026-07-19
