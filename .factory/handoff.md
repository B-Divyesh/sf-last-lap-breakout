# Last Lap Breakout repair handoff

## Release decision: DEPLOYED AND VERIFIED

This repair addresses the two release blockers from independent verification 5 (`9a8824baf8f14b94e66a59a61cd49aee577f98d9`) for candidate `399acadd2a87d8c8c2740e084052cc505979f38d`.

### What changed

1. Restoring a deliberately paused run now preserves its paused status. The saved lap, clock, score, hull, simulation tick, and board remain an exact snapshot until the player chooses **Resume run**. The previous mount path changed `paused` to `playing`, allowing the 60 Hz loop to run during reload and causing nondeterministic recovery drift.
2. Active runs now have an explicit `AUTOSAVE_INTERVAL_MS = 1000` cadence. The in-game statement **“Progress saves after each second”** is listed as the new `autosave-cadence` claim and is directly tested without a pause or settings action.
3. The local-recovery browser claim now asserts the exact pre-resume saved tick and clock after reload, then asserts that P resumes the fixed-step simulation. It no longer permits an arbitrary ten-tick drift.

## Reproduction of the reported failure

Before the repair, the exact verifier test was rerun with `npx playwright test --grep @claim:local-recovery --repeat-each=2`. Both runs failed at `tests/e2e/claims.spec.ts:287`:

- saved tick 99, restored tick 115 (required below 109)
- saved tick 94, restored tick 106 (required below 104)

The failure was caused by converting a restored `paused` state to `playing` during mount. The repaired focused claims passed three repeated runs each.

## Verification

- `npm ci`: PASS — 61 packages installed; 0 vulnerabilities.
- `npm test`: PASS — 6 Vitest core tests and 27 Playwright browser tests.
- `npx tsc --noEmit`: PASS. No lint script is defined for this small TypeScript project.
- `npm run build`: PASS — fresh `dist/` produced.
- Every `.factory/claims.json` command was run independently: all 18 passed, including `local-recovery` and `autosave-cadence`.
- Claims manifest contract: 18 unique IDs and exactly one matching `@claim:` test tag per ID.
- Production-preview `/` passed `/opt/fleet/lib/verify-url.sh`: 200 response, title, `lang=en`, one h1, main landmark, image alt coverage, labeled buttons, desktop and 390px screenshots, and zero console/page errors.
- The Playwright Axe WCAG 2 A/AA scan has zero serious or critical findings across `/`, `/demo`, `/privacy`, and `/terms`; the full suite also covers keyboard remapping/P pause, desktop and 390px touch/drag input, skip link/focus behavior, dialog focus, privacy, and route metadata.
- `@claim:offline-reload` passed in its own fresh browser context after service-worker activation; `@claim:reduced-motion`, `@claim:local-privacy`, and the 390px 4×-CPU frame claim passed independently.
- Local mobile Lighthouse (default mobile emulation) on the fresh production preview: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.4 s, LCP 1.7 s, TBT 0 ms, CLS 0.
- Fresh build sizes: main JavaScript 27,178 bytes raw / 9,980 bytes gzip; CSS 15,925 bytes raw / 4,390 bytes gzip; font 32,220 bytes; mobile AVIF 33,560 bytes; total `dist/` 368 KB.

## Deployment and live verification

- Deployed the fresh `dist/` to production Static Web App `sf-last-lap-breakout` in resource group `sociobot` with the app's scoped deployment credential. No staging slot or other product resource was touched.
- `https://last-lap-breakout.sociobot.in/` now references `main-B11hUcfd.js` and `style-D1Uo2pRS.css`. The live SHA-256 values byte-match this build: `index.html` `09d00f20c39785ae`, main JavaScript `139419bf0790cc77`, and CSS `5c7c914a545ef278`.
- Live `/`, `/demo`, `/play`, `/privacy`, and `/terms` return 200. `/missing-page` returns 404.
- Live root headers include the self-only CSP with `frame-ancestors 'none'`, HSTS, `nosniff`, strict-origin referrer policy, and camera/microphone/geolocation/payment denial. The live hashed JavaScript has `public, max-age=31536000, immutable` caching.
- Live `/opt/fleet/lib/verify-url.sh` passed at the product domain (649 ms): title, `lang=en`, one h1, main landmark, complete image alt coverage, labeled buttons, desktop and 390px screenshots, and zero console/page errors.
- A fresh live desktop and 390px mobile browser check passed title/landmarks, keyboard paddle movement, P pause, no horizontal overflow, same-origin-only requests, service-worker activation, and offline `/demo` reload.

## Run and deploy

```sh
npm ci
npm test
npm run build
npx playwright test --grep @claim:local-recovery
npx playwright test --grep @claim:autosave-cadence
```

Deploy `dist/` as the configured Static Web App. `public/staticwebapp.config.json` supplies the SPA routes, 404 rewrite, CSP and cache headers; `public/sw.js` supports offline reload after the first visit.

## Known gaps

There are no known product gaps from this repair. This is an account-free static browser game, so backend authentication, payment, API rate-limit, and consumer-package checks are not applicable.
