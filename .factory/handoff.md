# Last Lap Breakout verification handoff

## Release decision: READY

Repair commit: `0907e05` (`fix: close game QA release blockers`), pushed to `origin/main` and deployed to `https://last-lap-breakout.sociobot.in` on 2026-09-02. Static Web Apps deployment `b1392c0e-7050-4912-9a7a-e6c9fa8903f2` completed successfully.

## Repairs

- Reproduced the reported settings bug before changing code: opening **Game settings** changed the production-bundle timer from `60` to `59` in 1.6 seconds.
- Settings now pause only active play, preserve it while the native dialog is open, and resume it on close. The regression observes `60 → 60` while open and `60 → 59` after saving.
- The landing board is now a static sample rather than a full 960×1080 animation loop, removing the main-thread work that lowered mobile Lighthouse performance.
- Mapping `<select>` controls now have the designed gold 3px focus ring; the regression asserts computed `rgb(255, 209, 102)`, solid, 3px focus.
- Replaced duplicate Static Web Apps route keys with one routes array. Vite emits content-hashed JS/CSS under `/build/`; only that directory receives immutable one-year caching.
- Service-worker cache advanced to `last-lap-breakout-v4` and precaches `/build/` assets.
- Fixed fixed-step floating-point residue that could add one frame to a 60-second lap, and hid terminal-state Pause so it cannot be an enabled no-op.
- Expanded `.factory/claims.json` from 8 to 15 exact, uniquely tagged browser checks. Coverage now includes fixed laps, modifiers, guarded final core, demo isolation, assist, remapping, copy, deterministic builds, hull loss, reduced motion, and mobile/touch cadence.

## Verification

- `npm ci` — PASS: 61 packages, 0 vulnerabilities.
- `npm test` — PASS: 6 Vitest core tests and 24 Playwright browser tests.
- Every one of the 15 exact commands declared in `.factory/claims.json` was run individually and passed.
- `npx tsc --noEmit` and `npm run build` — PASS; `dist/` produced.
- Build size: 27,163 bytes raw main JS / 9,918 bytes gzip; 15,925 bytes raw CSS / 4,390 bytes gzip; total `dist/` 368 KB.
- `@claim:finite-run` executes title → sample → seven modifier drafts → **Run complete**, advances the real fixed-step core through exactly 8 × 60 seconds, and reaches the actual result UI.
- Deployed mobile Lighthouse 12.8.2, three fresh runs: performance/accessibility/best-practices/SEO `100/100/100/100`; LCP `1.282 s`, `1.276 s`, `1.282 s`; TBT `11 ms`, `23 ms`, `7 ms`; CLS `0.00016`.
- `verify-url.sh https://last-lap-breakout.sociobot.in` — PASS: HTTPS 200, 663 ms network-idle load, title, `lang=en`, one main/h1, alt text, labelled buttons, and no root console errors.
- Playwright Axe WCAG 2 A/AA scans found zero serious or critical findings on `/`, `/demo`, `/play`, `/privacy`, and `/terms` at 1440×900 and 390×844. The standalone Axe CLI cannot discover this container’s Playwright-only Chromium; the repository’s installed Playwright Axe integration was used instead.
- Live manual browser check: mapping select focus is gold/solid/3px; settings keep timer `60` for 1.6 seconds and resume to `59` after close; no page or console errors.
- Live service worker is controlling, uses `last-lap-breakout-v4`, and reloads `/demo` offline after an online visit.
- Live `/missing-page` returns HTTP 404. Root and service worker use 30-second revalidation; live hashed `/build/main-PzC3fumr.js` and `/build/style-D1Uo2pRS.css` return `public, max-age=31536000, immutable`.
- Local and deployed SHA-256 values match for `index.html`, `404.html`, `sw.js`, main JS, CSS, and the shared style JS.

## Run and deploy

```sh
npm ci
npm test
npx tsc --noEmit
npm run build
/opt/fleet/lib/deploy-static.sh last-lap-breakout dist
```

## Known gaps

None. This is a static, account-free game with no backend/API, billing, Entra, or request-rate policy to verify.
